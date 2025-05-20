provider "aws" {
  region = "us-east-1"
}

locals {
  fqdn         = var.subdomain != "" ? "${var.subdomain}.${var.domain_name}" : var.domain_name
  bucket_name  = "taskvision-${var.environment}-frontend"
}

variable "cloudfront_distribution_id" {
  description = "ID of the existing CloudFront distribution to use"
  type        = string
}

data "aws_cloudfront_distribution" "frontend" {
  id = var.cloudfront_distribution_id
}

resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "frontend-oac-${var.environment}"
  description                       = "Access control for CloudFront to S3"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_s3_bucket" "frontend" {
  bucket = local.bucket_name

  tags = {
    Environment = var.environment
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
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
        Resource = "${aws_s3_bucket.frontend.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = data.aws_cloudfront_distribution.frontend.arn
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
    name                   = data.aws_cloudfront_distribution.frontend.domain_name
    zone_id                = data.aws_cloudfront_distribution.frontend.hosted_zone_id
    evaluate_target_health = false
  }
}

module "acm" {
  source      = "./modules/acm"
  domain_name = local.fqdn
  san_list    = []
  zone_id     = var.route53_zone_id
  environment = var.environment
}
