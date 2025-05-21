provider "aws" {
  region = "us-east-1"
}

locals {
  fqdn         = var.subdomain != "" ? "${var.subdomain}.${var.domain_name}" : var.domain_name
  bucket_name  = var.s3_bucket_name
}

# CloudFront Distribution
data "aws_cloudfront_distribution" "existing" {
  count = var.cloudfront_distribution_id != "" ? 1 : 0
  id    = var.cloudfront_distribution_id
}

# S3 Bucket
data "aws_s3_bucket" "existing" {
  bucket = var.s3_bucket_name
}

locals {
  bucket_id = data.aws_s3_bucket.existing.id
  bucket_arn = data.aws_s3_bucket.existing.arn
}

locals {
  cloudfront_distribution_arn = data.aws_cloudfront_distribution.existing[0].arn
  cloudfront_domain_name = data.aws_cloudfront_distribution.existing[0].domain_name
  cloudfront_hosted_zone_id = data.aws_cloudfront_distribution.existing[0].hosted_zone_id
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
