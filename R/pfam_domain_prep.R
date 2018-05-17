# ===========================================================
# HUGO gene symbol => UniProt ID => Pfam Domain Information
# ===========================================================

get_uniprot_info <- function(uniprot.id, include.seq = FALSE){
  # get uniprot information
  #
  # Args:
  #   uniprot.id: UniProt ID
  #
  # Returns:
  #   Data frame with headers "uniprot_id", "hgnc_symbol", "protein_name", "length", "sequence" (optional)
  library(UniProt.ws, quietly = TRUE)
  
  # get sequence information (protein length, sequence informatio optional)
  humanUp <- UniProt.ws(taxId=9606)
  cols <- c("UNIPROTKB", "GENECARDS", "PROTEIN-NAMES", "LENGTH", "SEQUENCE")
  kt <- "UNIPROTKB"
  
  # columns(humanUp) keytypes(humanUp)
  suppressMessages(uniprot.df <- select(humanUp, uniprot.id, cols, kt))
  
  colnames(uniprot.df) <- c("uniprot_id", "hgnc_symbol", "protein_name", "length", "sequence")
  if(!include.seq){
    uniprot.df = uniprot.df[, - which(colnames(uniprot.df) == "sequence")]
  }
  
  uniprot.df
}

hgnc2uniprot <- function(hgnc.symbol, include.seq = FALSE){
  # Map from hgnc symbol to uniprot id
  #
  # Args:
  #   hgnc.symbol: HUGO symbol
  #   include.seq: if return protein sequence information
  #
  # Returns:
  #   A data frame with headers "hgnc_symbol", "uniprot_id", "protein_name", "length", "sequence" (optional)
  library(UniProt.ws, quietly = TRUE)
  
  # get sequence information (protein length, sequence informatio optional)
  humanUp <- UniProt.ws(taxId = 9606)
  cols <- c("GENECARDS", "UNIPROTKB", "PROTEIN-NAMES", "LENGTH", "SEQUENCE")
  kt <- "GENECARDS"

  # columns(humanUp) keytypes(humanUp)
  suppressMessages(uniprot.df <- select(humanUp, hgnc.symbol, cols, kt))

  colnames(uniprot.df) <- c("hgnc_symbol", "uniprot_id", "protein_name", "length", "sequence")
  if(!include.seq){
    uniprot.df = uniprot.df[, - which(colnames(uniprot.df) == "sequence")]
  }
  
  uniprot.df
}

uniprot2pfam <- function(uniprot.id, grch = "grch37", ...){
  # Get pfam information for the given uniprot id
  # 
  # Args:
  #   uniprot.id: UniProt id
  #   grch: Genome Reference Consortium Human build (37 or 38), default grch37
  #
  # Returns:
  #   Data frame with headers "pfam_ac", "pfam_start", "pfam_end", "pfam_id" ordered by "pfam_start" and "pfam_end"
  library(biomaRt, quietly = TRUE)
  library(PFAM.db, quietly = TRUE)
  suppressMessages(library(DBI))
  
  if(grch == "grch37"){
    # default is grch37
    mart <- useMart(biomart = "ENSEMBL_MART_ENSEMBL", 
                    host    = "grch37.ensembl.org", 
                    dataset = "hsapiens_gene_ensembl",
                    ...)
  } else {
    mart <- useMart(biomart = "ENSEMBL_MART_ENSEMBL",
                    dataset = "hsapiens_gene_ensembl",
                    ...)
  }
  
  pfam.df <- getBM(
    attributes = c("pfam", "pfam_start", "pfam_end"),
    filters    = c("uniprotswissprot", "with_uniprotswissprot", "with_pfam"),
    values     = list(uniprot.id, TRUE, TRUE),
    mart       = mart,
    uniqueRows = TRUE)
  
  colnames(pfam.df)[colnames(pfam.df) == "pfam"] = "pfam_ac"
  
  for(idx in 1:nrow(pfam.df)){
    pfam.id <- dbGetQuery(PFAM_dbconn(), paste0("SELECT id FROM id WHERE ac = '", pfam.df[idx, "pfam_ac"], "'"))[1, 1]
    pfam.df[idx, "pfam_id"] <- pfam.id
  }
  
  # sort by domain position
  pfam.df <- pfam.df[with(pfam.df, order(pfam_start, pfam_end)),]
  
  pfam.df
}

hgnc2pfam <- function(hgnc.symbol, include.seq = FALSE, grch = "grch37", ...){
  # Mapping from HGNC symbol to Pfam domains; if the given HUGO symbol maps to multiple UniProt IDs, return NA
  # 
  # Args:
  #   hgnc.symbol: HUGO symbol
  #   include.seq: if include protein sequence information
  #   grch: Genome Reference Consortium Human build (37 or 38), default grch37
  # 
  # Returns:
  #   A list with attributes: $hgnc_symbol, $uniprot_id, $protein_name, $length, $sequence (optional), $pfam (list); If the given HUGO symbol maps to multiple UniProt IDs, return NA
  uniprot.df <- hgnc2uniprot(hgnc.symbol, include.seq)

  if(nrow(uniprot.df) == 1){
    pfam.df <- uniprot2pfam(uniprot.df[1, "uniprot_id"], grch, ...)
  } else if(nrow(uniprot.df) ==  0){
    warning(hgnc.symbol, " has no uniprot mappings (probably non-coding gene)", "\n")
    pfam.df <- NA
  } else {
    warning(hgnc.symbol, " has multiple uniprot mapping: ", paste(uniprot.df[, "uniprot_id"], collapse = " | "), ", please choose one\n")
    pfam.df <- NA
  }

  output.list = as.list(uniprot.df)
  output.list$pfam = pfam.df
  output.list$length = as.numeric(output.list$length)

  output.list
}

download_hgnc2uniprot_local <- function(){
  # get hgnc2uniprot mapping from UniProt database and save as RDS file
  # 
  # Returns:
  #   RDS file name
  library(RCurl, quietly = TRUE)
  
  hgnc.mapping.file = getURL("https://www.genenames.org/cgi-bin/download?col=gd_hgnc_id&col=gd_app_sym&col=gd_app_name&col=gd_aliases&col=md_prot_id&status=Approved&status_opt=2&where=&order_by=gd_app_sym_sort&format=text&limit=&submit=submit",
                             ssl.verifyhost = FALSE,
                             ssl.verifypeer = FALSE)
  hgnc.mapping.df = read.table(textConnection(hgnc.mapping.file), 
                               header = TRUE,
                               sep = "\t",
                               quote = "",
                               check.name = FALSE,
                               fill = TRUE)
  date.info = Sys.Date()
  file.name = paste0("hgnc2uniprot_", date.info, ".rds")
  saveRDS(hgnc.mapping.df, file.name)
  
  cat("Saved HGNC-to-UniProt mappings to", file.name, "\n")
  
  file.name
}

hgnc2uniprot_local <- function(local.file, hgnc.symbol, include.seq = FALSE, grch = "grch37", ...){
  # get HGNC-to-Pfam mapping from local RDS file; if HUGO symbol maps to multiple UniProt IDs, select the primary one
  #
  # Args:
  #   local.file: local RDS file
  #   hgnc.symbol: HGNC symbol
  #   include.seq: if return protein sequence information
  #   grch: Genome Reference Consortium Human build (37 or 38), default grch37
  #
  # Returns:
  #   A list with attributes: $hgnc_symbol, $uniprot_id, $protein_name, $length, $sequence (optional), $pfam (list); if the given HUGO symbol maps to multiple UniProt IDs, select the primary one
  hgnc2uniprot.df <- readRDS(local.file)
  
  hgnc.info <- hgnc2uniprot.df[which(hgnc2uniprot.df$`Approved Symbol` == hgnc.symbol), ]
  uniprot.line <- as.character(hgnc.info$`UniProt ID(supplied by UniProt)`)
  
  # select primary uniprot id
  uniprot.ids <- strsplit(uniprot.line, ", ")[[1]]
  uniprot.num <- length(uniprot.ids)
  output.list <- list(hgnc_symbol = as.character(hgnc.info[1, "Approved Symbol"]), 
                      protein_name = as.character(hgnc.info[1, "Approved Name"]))
  
  if(uniprot.num == 0){
    warning(hgnc.symbol, " has no UniProt mappings (probably non-coding gene)", "\n")
  } else {
    uniprot.id <- uniprot.ids[1]
    if(uniprot.num == 1){
      cat(hgnc.symbol, "maps to UniProt id", uniprot.id, "\n")
    } else {
      warning(hgnc.symbol, " has multiple UniProt mappings: ", paste(uniprot.ids, collapse = " | "), ", chose primary Uniprot ", uniprot.id, "\n")
    }
    
    uniprot.info = get_uniprot_info(uniprot.id, include.seq)
    output.list$uniprot_id = as.character(uniprot.info[1, "uniprot_id"])
    
    if(include.seq){
      output.list$sequence = uniprot.info[1, "sequence"]
    }
    output.list$length = as.numeric(uniprot.info[1, "length"])
  }
  
  output.list
}

hgnc2pfam_local <- function(local.file, hgnc.symbol, include.seq = FALSE, grch = "grch37", ...){
  # get HGNC-to-Pfam mapping from local RDS file
  #
  # Args:
  #   local.file: local RDS file
  #   hgnc.symbol: HGNC symbol
  #   include.seq: if return protein sequence information
  #   grch: Genome Reference Consortium Human build (37 or 38), default grch37
  #
  # Returns:
  #   A list with attributes: $hgnc_symbol, $uniprot_id, $protein_name, $length, $sequence (optional), $pfam (list)
  hgnc2uniprot.df <- readRDS(local.file)

  hgnc.info <- hgnc2uniprot.df[which(hgnc2uniprot.df$`Approved Symbol` == hgnc.symbol), ]
  uniprot.line <- as.character(hgnc.info$`UniProt ID(supplied by UniProt)`)
  
  # select primary uniprot id
  uniprot.ids <- strsplit(uniprot.line, ", ")[[1]]
  uniprot.num <- length(uniprot.ids)
  output.list <- list(hgnc_symbol = as.character(hgnc.info[1, "Approved Symbol"]), 
                      protein_name = as.character(hgnc.info[1, "Approved Name"]))
  
  if(uniprot.num == 0){
    warning(hgnc.symbol, " has no UniProt mappings (probably non-coding gene)", "\n")
  } else {
    uniprot.id <- uniprot.ids[1]
    if(uniprot.num == 1){
      cat(hgnc.symbol, "maps to UniProt id", uniprot.id, "\n")
    } else {
      warning(hgnc.symbol, " has multiple UniProt mappings: ", paste(uniprot.ids, collapse = " | "), ", chose primary Uniprot ", uniprot.id, "\n")
    }
    
    uniprot.info = get_uniprot_info(uniprot.id, include.seq)
    pfam.df = uniprot2pfam(uniprot.id, grch, ...)
    
    output.list$uniprot_id = as.character(uniprot.info[1, "uniprot_id"])
    
    if(include.seq){
      output.list$sequence = uniprot.info[1, "sequence"]
    }
    output.list$length = as.numeric(uniprot.info[1, "length"])
    output.list$pfam = pfam.df
  }
  
  output.list
}
