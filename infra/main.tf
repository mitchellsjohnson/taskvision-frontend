provider "aws" {
  region = "us-east-1"
}

locals {
  fqdn         = var.subdomain != "" ? "${var.subdomain}.${var.domain_name}" : var.domain_name
  bucket_name  = var.s3_bucket_name != "" ? var.s3_bucket_name : "taskvision-${var.environment}-frontend"
  create_s3    = var.s3_bucket_name == ""
  create_cf    = var.cloudfront_distribution_id == ""
}

# Fetch existing CloudFront if ID provided
data "aws_cloudfront_distribution" "existing" {
  count = local.create_cf ? 0 : 1
  id    = var.cloudfront_distribution_id
}

# Fetch existing S3 if name provided
data "aws_s3_bucket" "existing" {
  count  = local.create_s3 ? 0 : 1
  bucket = var.s3_bucket_name
}

resource "aws_s3_bucket" "frontend" {
  count  = local.create_s3 ? 1 : 0
  bucket = local.bucket_name

  lifecycle {
    prevent_destroy = true
  }

  tags = {
    Environment = var.environment
  }
}

locals {
  bucket_id = local.create_s3 ? aws_s3_bucket.frontend[0].id : data.aws_s3_bucket.existing[0].id
  bucket_arn = local.create_s3 ? aws_s3_bucket.frontend[0].arn : data.aws_s3_bucket.existing[0].arn
}

resource "aws_cloudfront_distribution" "frontend" {
  count                = local.create_cf ? 1 : 0
  enabled              = true
  is_ipv6_enabled      = true
  default_root_object  = "index.html"
  aliases              = [local.fqdn]

  origin {
    domain_name              = local.bucket_id
    origin_id                = "frontendS3Origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend[0].id
  }

  default_cache_behavior {
    target_origin_id       = "frontendS3Origin"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = module.acm.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Environment = var.environment
  }

  depends_on = [module.acm]
}

locals {
  cloudfront_distribution_arn = local.create_cf ? aws_cloudfront_distribution.frontend[0].arn : data.aws_cloudfront_distribution.existing[0].arn
  cloudfront_domain_name      = local.create_cf ? aws_cloudfront_distribution.frontend[0].domain_name : data.aws_cloudfront_distribution.existing[0].domain_name
  cloudfront_hosted_zone_id  = local.create_cf ? aws_cloudfront_distribution.frontend[0].hosted_zone_id : data.aws_cloudfront_distribution.existing[0].hosted_zone_id
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = local.bucket_id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "AllowCloudFrontServicePrincipal"
        Effect    = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${local.bucket_arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = local.cloudfront_distribution_arn
          }
        }
      }
    ]
  })
}

resource "aws_route53_record" "frontend_alias" {
  zone_id = var.route53_zone_id
  name    = local.fqdn
  type    = "A"
  allow_overwrite = true

  alias {
    name                   = local.cloudfront_domain_name
    zone_id                = local.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

module "acm" {
  source      = "./modules/acm"
  domain_name = local.fqdn
  san_list    = var.san_list
  zone_id     = var.route53_zone_id
  environment = var.environment
}
