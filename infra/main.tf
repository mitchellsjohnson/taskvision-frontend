provider "aws" {
  region = "us-east-1"
}

locals {
  fqdn = var.subdomain != "" ? "${var.subdomain}.${var.domain_name}" : var.domain_name
}

# Reference existing S3 bucket
data "aws_s3_bucket" "frontend" {
  bucket = var.s3_bucket_name
}

# Reference existing CloudFront distribution
data "aws_cloudfront_distribution" "frontend" {
  id = var.cloudfront_distribution_id
}

# S3 bucket policy to allow CloudFront access
resource "aws_s3_bucket_policy" "frontend" {
  bucket = data.aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "AllowCloudFrontAccess",
        Effect    = "Allow",
        Principal = {
          Service = "cloudfront.amazonaws.com"
        },
        Action    = "s3:GetObject",
        Resource  = "${data.aws_s3_bucket.frontend.arn}/*",
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = data.aws_cloudfront_distribution.frontend.arn
          }
        }
      }
    ]
  })
}

# Route53 record pointing to CloudFront
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