variable "domain_name" {
  type        = string
  description = "Primary domain for the certificate"
}

variable "san_list" {
  type        = list(string)
  description = "Subject alternative names"
  default     = []
}

variable "zone_id" {
  type        = string
  description = "Route 53 hosted zone ID"
}

variable "environment" {
  type        = string
  description = "Environment name (e.g., dev or prod)"
}