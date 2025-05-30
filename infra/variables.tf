variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
}

variable "subdomain" {
  description = "Subdomain for the frontend (e.g., dev, prod)"
  type        = string
}

variable "domain_name" {
  description = "Base domain name"
  type        = string
}

variable "zone_id" {
  description = "Route53 hosted zone ID"
  type        = string
}

variable "s3_bucket_name" {
  description = "Name of the existing S3 bucket"
  type        = string
}

variable "cloudfront_distribution_id" {
  description = "ID of the existing CloudFront distribution"
  type        = string
}


