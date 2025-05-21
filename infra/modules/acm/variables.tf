variable "domain_name" {
  description = "Domain name for the certificate"
  type        = string
}

variable "san_list" {
  description = "Optional subject alternative names for the cert"
  type        = list(string)
  default     = []
}

variable "zone_id" {
  description = "Route53 hosted zone ID"
  type        = string
}

variable "environment" {
  description = "Environment name (e.g., dev, prod)"
  type        = string
}