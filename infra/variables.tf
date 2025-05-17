variable "domain_name" {
  description = "The custom domain for the CloudFront distribution"
  type        = string
}

variable "san_list" {
  description = "Optional list of SANs"
  type        = list(string)
  default     = []
}

variable "zone_id" {
  description = "Route 53 Hosted Zone ID"
  type        = string
}

variable "s3_bucket_domain_name" {
  description = "S3 bucket domain name for frontend hosting"
  type        = string
}