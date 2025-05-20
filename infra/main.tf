provider "aws" {
  region = "us-east-1"
}

locals {
  fqdn         = var.subdomain != "" ? "${var.subdomain}.${var.domain_name}" : var.domain_name
  bucket_name  = var.s3_bucket_name != "" ? var.s3_bucket_name : "taskvision-${var.environment}-frontend"
}

# CloudFront Distribution
data "aws_cloudfront_distribution" "existing" {
  count = var.cloudfront_distribution_id != "" ? 1 : 0
  id    = var.cloudfront_distribution_id
}

# S3 Bucket
data "aws_s3_bucket" "existing" {
  count  = var.s3_bucket_name != "" ? 1 : 0
  bucket = var.s3_bucket_name
}

resource "aws_s3_bucket" "frontend" {
  count  = var.s3_bucket_name == "" ? 1 : 0
  bucket = local.bucket_name

  tags = {
    Environment = var.environment
  }

  lifecycle {
    prevent_destroy = true
  }
}

locals {
  bucket_id = var.s3_bucket_name != "" ? data.aws_s3_bucket.existing[0].id : aws_s3_bucket.frontend[0].id
  bucket_arn = var.s3_bucket_name != "" ? data.aws_s3_bucket.existing[0].arn : aws_s3_bucket.frontend[0].arn
}

resource "aws_cloudfront_origin_access_control" "frontend" {
  count = var.cloudfront_distribution_id == "" ? 1 : 0

  name                              = "frontend-oac-${var.environment}"
  description                       = "Access control for CloudFront to S3"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "frontend" {
  count = var.cloudfront_distribution_id == "" ? 1 : 0

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  aliases             = [local.fqdn]

  origin {
    domain_name              = local.bucket_id
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend[0].id
    origin_id                = "S3-${local.bucket_id}"
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${local.bucket_id}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
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
}

locals {
  cloudfront_distribution_arn = var.cloudfront_distribution_id != "" ? data.aws_cloudfront_distribution.existing[0].arn : aws_cloudfront_distribution.frontend[0].arn
  cloudfront_domain_name = var.cloudfront_distribution_id != "" ? data.aws_cloudfront_distribution.existing[0].domain_name : aws_cloudfront_distribution.frontend[0].domain_name
  cloudfront_hosted_zone_id = var.cloudfront_distribution_id != "" ? data.aws_cloudfront_distribution.existing[0].hosted_zone_id : aws_cloudfront_distribution.frontend[0].hosted_zone_id
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
