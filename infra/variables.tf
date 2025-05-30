variable "environment" {
  description = "Deployment environment (e.g., dev, prod)"
  type        = string
}

variable "subdomain" {
  description = "Subdomain (e.g., dev, prod)"
  type        = string
}

variable "domain_name" {
  description = "Primary domain name (e.g., taskvision.ai)"
  type        = string
}

variable "zone_id" {
  description = "Route 53 Hosted Zone ID"
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

variable "san_list" {
  description = "Optional subject alternative names for the cert"
  type        = list(string)
  default     = []
}


