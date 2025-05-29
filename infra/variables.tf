
variable "environment" {
  description = "Deployment environment name (e.g., dev, prod)"
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
  description = "Optional SANs for the ACM certificate"
  type        = list(string)
  default     = []
}

variable "cloudfront_distribution_id" {
  description = "Existing CloudFront distribution ID"
  type        = string
}

variable "s3_bucket_name" {
  description = "Existing S3 bucket name"
  type        = string
}
