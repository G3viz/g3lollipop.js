# =========================================
# Download TP53 mutation data using cBioPortal R package "cgdsr"
# parse to recommended JSON format
# =========================================
setwd("~/Projects/cancer.js/lollipop/demo/data/R/")
# remove all variables (optional)
rm(list = ls())

# use CGDSR package (supported by cBioPortal)
library(cgdsr)

# =========================================
#gene.symbol <- "TP53"
gene.symbol <- "BRAF"
study.id <- "msk_impact_2017"
out.dir <- "../snv/"

dir.create(out.dir, showWarnings = FALSE)
# =========================================
# create CGDS object
cgds <- CGDS("http://www.cbioportal.org/")

# select pan-lung-cancer-study from TCGA 2016 Nat Genet
genetic.profiles <- getGeneticProfiles(cgds, study.id)

# select somatic mutation profile (msk_impact_2017_mutations)
mutation.idx <- 2
mutation.profile <- genetic.profiles[mutation.idx, "genetic_profile_id"]

# somatic mutation ids (nsclc_tcga_broad_2016_sequenced)
case.list.details <- getCaseLists(cgds, study.id)[mutation.idx, ]
mutation.case.list.id <- case.list.details$case_list_id

# number of cases (1144)
num.case <- length(strsplit(case.list.details$case_ids, " ")[[1]])

# retrieve extended mutation data
# [TODO] read clinical information, add cancer type
extended.mutation.data <- getMutationData(cgds, mutation.case.list.id, mutation.profile, gene.symbol)

# columns: Hugo_Symbol, Protein_Change, Sample_ID, Mutation_Type, 
#          Chromosome, Start_Position, End_Position, 
#          Reference_Allele, Variant_Allele
truncated.mutation.data <- extended.mutation.data[, c("gene_symbol", "amino_acid_change", "case_id", "mutation_type", 
                                                    "chr", "start_position", "end_position",
                                                    "reference_allele", "variant_allele")]

# rename headers according to cbioportal MutationMapper
# url: http://www.cbioportal.org/mutation_mapper.jsp
colnames(truncated.mutation.data) = c("Hugo_Symbol", "Protein_Change", "Sample_ID", "Mutation_Type", 
                                      "Chromosome", "Start_Position", "End_Position",
                                      "Reference_Allele", "Variant_Allele")

file.name <- paste0(out.dir, "/", gene.symbol, "-", study.id, "-full.tsv")
write.table(truncated.mutation.data, file.name, sep = "\t", quote = FALSE, col.name = TRUE, row.name = FALSE)

# =========================================
source("./mutation_data_utils.R")

mutation_df <- truncated.mutation.data
mutation_type_col <- "Mutation_Type"
mutation_class_col <- "Mutation_Class"
protein_change_col <- "Protein_Change"
amino_acid_position_col <- "AA_Position"

# remove un-necessary columns
mutation_df <- mutation_df[, c(protein_change_col, mutation_type_col)]

# calcualte amino acid position
mutation_df <- parseProtionChangeColumn(mutation_df, protein_change_col, mutation_type_col, mutation_class_col, amino_acid_position_col)

# save to file
write.table(mutation_df, file = paste0(out.dir, "/", gene.symbol, "-", study.id, "-parsed.tsv"),
            sep = "\t", quote = FALSE, col.name = TRUE, row.name = FALSE)

# =========================================