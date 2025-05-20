provider "aws" {
  region = "us-east-1"
}

resource "random_id" "suffix" {
  byte_length = 2
}

locals {
  fqdn         = var.subdomain != "" ? "${var.subdomain}.${var.domain_name}" : var.domain_name
  bucket_name  = "taskvision-${var.environment}-frontend-${random_id.suffix.hex}"
  oac_name     = "frontend-oac-${var.environment}"
}

module "acm" {
  source      = "./modules/acm"
  domain_name = local.fqdn
  san_list    = []
  zone_id     = var.route53_zone_id
  environment = var.environment
}

resource "aws_s3_bucket" "frontend" {
  bucket        = local.bucket_name
  force_destroy = true

  lifecycle {
    ignore_changes = [
      bucket,
      tags
    ]
  }

  tags = {
    Environment = var.environment
  }
}

resource "aws_s3_bucket_versioning" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  rule {
    id     = "cleanup"
    status = "Enabled"

    expiration {
      days = 30
    }
  }
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = true
  restrict_public_buckets = true
}

resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${local.oac_name}-${formatdate("YYYYMMDDHHmmss", timestamp())}"
  description                       =
