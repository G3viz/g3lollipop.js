rm(list = ls())
source("protein_domain_mapper.R")

# ================================================
# ================================================
library(jsonlite, quietly = TRUE)

# download lastest uniprot mapping table from UniProt
uniprot.rds <- download_hgnc2uniprot_local()

# ================================================
# ================================================
hgnc.symbol <- "TP53"

# query uniprot information from HUGO symbol
# (thru UniProtWS, protein name may be redundant)
uniprot.info <- hgnc2uniprot(hgnc.symbol, include.seq = TRUE)
uniprot.info

# count number of uniprot ids
num.uniprot.ids <- nrow(uniprot.info)
cat(hgnc.symbol, "maps to", num.uniprot.ids, "UniProt IDS:",
    paste(uniprot.info[, "uniprot_id"], collapse = " | "), "\n")

# query uniprot information from HUGO symbol (thru local UniProt RDS)
# if HOGO symbol maps to multiple UniProt IDs, select the primary UniProt ID
# protein name is succinct
uniprot.info2 <- hgnc2uniprot_local(uniprot.rds, hgnc.symbol, include.seq = TRUE)
uniprot.info2

# query UniProt information from UniProt ID (thru UniProtWS)
uniprot.id <- uniprot.info2$uniprot_id
uniprot.info3 <- get_uniprot_info(uniprot.id, include.seq = TRUE)
uniprot.info3

# ================================================
# query Pfam domain information from HUGO symbol
pfam.info <- hgnc2pfam(hgnc.symbol, include.seq = TRUE)
pfam.info

# query pfam information from UniProt ID
pfam.info2 <- uniprot2pfam(uniprot.id)
pfam.info2

# get uniprot ids from local file (fast; good form batch queries)
pfam.info3 <- hgnc2pfam_local(uniprot.rds, hgnc.symbol, include.seq = TRUE)
pfam.info3

# ================================================
# ================================================
# HUGO gene symbol => UniProt ID => Pfam Domain Information
# (HUGO symbol maps to multiple UniProt IDs)
hgnc.symbol <- "CDKN2A"

# query uniprot information from HUGO symbol
# (thru UniProtWS, protein name may be redundant)
uniprot.info <- hgnc2uniprot(hgnc.symbol, include.seq = TRUE)
uniprot.info

# count number of uniprot ids
num.uniprot.ids <- nrow(uniprot.info)
cat(hgnc.symbol, "maps to", num.uniprot.ids, "UniProt IDS:",
    paste(uniprot.info[, "uniprot_id"], collapse = " | "), "\n")

# query uniprot information from HUGO symbol (thru local UniProt RDS)
# if HOGO symbol maps to multiple UniProt IDs, select the primary UniProt ID
# protein name is succinct
uniprot.info2 <- hgnc2uniprot_local(uniprot.rds, hgnc.symbol, include.seq = TRUE)
uniprot.info2

# query UniProt information from UniProt ID (thru UniProtWS)
uniprot.id <- uniprot.info2$uniprot_id
uniprot.info3 <- get_uniprot_info(uniprot.id, include.seq = TRUE)
uniprot.info3

# ================================================
# query Pfam domain information from HUGO symbol
# since HUGO symbol maps to multiple UniProt IDs, Pfam information is NA
pfam.info <- hgnc2pfam(hgnc.symbol, include.seq = TRUE)
pfam.info

# query pfam information from UniProt ID
pfam.info2 <- uniprot2pfam(uniprot.id)
pfam.info2

# get uniprot ids from local file (faster; good form batch queries)
pfam.info3 <- hgnc2pfam_local(uniprot.rds, hgnc.symbol, include.seq = TRUE)
pfam.info3

# ================================================
# create Pfam domain information for some genes
genes <- c("TP53", "KRAS", "BRAF", "EGFR", "PIK3CA")
out.dir <- "./domain/"
dir.create(out.dir, showWarnings = FALSE)
library(jsonlite, quietly = TRUE)

for(hgnc.symbol in genes){
  cat(hgnc.symbol, "\n")
  pfam.info <- hgnc2pfam_local(uniprot.rds, hgnc.symbol, include.seq = FALSE)

  output.json = toJSON(pfam.info, pretty = FALSE, auto_unbox = TRUE)
  write(output.json, paste0(out.dir, "/", hgnc.symbol, "_pfam.json"))
}

