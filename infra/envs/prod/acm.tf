module "acm_prod" {
  source      = "../../modules/acm"
  domain_name = "taskvision.ai"
  san_list    = []
  zone_id     = var.zone_id
  environment = "prod"
}

output "certificate_arn_prod" {
  value = module.acm_prod.certificate_arn
}