variable "domain_name" {
  description = "Base domain name"
  type        = string
}

variable "subdomain" {
  description = "Optional subdomain to use (e.g., www)"
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
  description = "Name of the existing S3 bucket"
  type        = string
}

variable "acm_certificate_arn" {
  description = "ARN of the existing ACM certificate"
  type        = string
}
