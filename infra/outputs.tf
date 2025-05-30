output "s3_bucket_name" {
  description = "Name of the S3 bucket hosting the frontend"
  value       = data.aws_s3_bucket.frontend.bucket
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = data.aws_cloudfront_distribution.frontend.id
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = data.aws_cloudfront_distribution.frontend.domain_name
}

output "certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = data.aws_acm_certificate.frontend.arn
}
