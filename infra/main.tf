provider "aws" {
  region = "us-east-1"
}

locals {
  fqdn = var.subdomain != "" ? "${var.subdomain}.${var.domain_name}" : var.domain_name
}

data "aws_s3_bucket" "frontend" {
  bucket = var.s3_bucket_name
}

data "aws_cloudfront_distribution" "frontend" {
  id = var.cloudfront_distribution_id
}
