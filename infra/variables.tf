variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
}

variable "domain_name" {
  description = "Base domain name"
  type        = string
}

variable "subdomain" {
  description = "Subdomain to use (e.g., dev, www)"
  type        = string
  default     = ""
}

variable "route53_zone_id" {
  description = "Route53 hosted zone ID"
  type        = string
}

variable "san_list" {
  description = "Optional subject alternative names for the cert"
  type        = list(string)
  default     = []
}

variable "cloudfront_distribution_id" {
  description = "Optional ID of an existing CloudFront distribution to use. If not provided, a new distribution will be created."
  type        = string
  default     = ""
}

variable "s3_bucket_name" {
  description = "Optional name of an existing S3 bucket to use. If not provided, a new bucket will be created."
  type        = string
  default     = ""
}


