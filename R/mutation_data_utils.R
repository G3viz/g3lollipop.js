# ===================================
firstNonEmpty <- function(instr){
  for(e in instr){
    if(e != ""){
      return(e);
    }
  }
}

parsePosition <- function(pos_str, mut_type, mt_class){
  if(is.na(mt_class) || mt_class == "Other" || mt_class == ""){
    return(NA)
  }
  
  library(stringr, quietly = TRUE)
  
  cln_str <- firstNonEmpty(strsplit(pos_str, "\\*")[[1]])
  p_pos <- as.numeric(str_extract_all(cln_str, "[0-9]+")[[1]])
  
  if(length(p_pos) == 1 && is.na(p_pos[1])){
    return(NA)
  } else{
    return(round(mean(p_pos)))
  }
}

getMutationTable <- function(){
  mutation.table.rds <- "mutation_type_to_class_mapping.RDS"
  mutation.table.df <- readRDS(mutation.table.rds)
  mutation.table.df
}

checkDominantMutationClass = function(vec){
  t = summary(vec)
  return(names(t)[which(t == max(t))])
}

splitByFactor = function(df, factors, colToRemove=NULL){
  d = split(df, factors)
  
  t = lapply(d, function(chunk){
    count = nrow(chunk)
    
    if(!is.null(colToRemove)){
      chunk = chunk[, !(names(chunk) %in% colToRemove)]
    }
    
    l = list(count=count, value=chunk)
  })
  
  return(t)
}

splitByPosition = function(df, factors, colToRemove=NULL){
  d = split(df, factors)
  
  arr = c()
  idx = 1
  
  for(t in names(d)){
    chunk = d[[t]]
    pos = as.numeric(t)
    count = nrow(chunk)
    mutation = checkDominantMutationClass(chunk$Mutation.class)
    
    if(!is.null(colToRemove)){
      chunk = chunk[, !(names(chunk) %in% colToRemove)]
    }
    
    l = list(position = pos,
             count = count,
             class = mutation,
             value = chunk)
    arr[idx][[1]] = l
    idx = idx + 1
  }
  
  return(arr)
}

# ===================================
praseMutationTypeColumn <- function(mutation_df, mutation_type_col = "Mutation_Type", mutation_class_col = "Mutation_Class"){
  mutation.table.df <- getMutationTable()
  
  # check if mutation_df has mutation_type_col
  if(!mutation_type_col %in% colnames(mutation_df)){
    warning("Undefined column: ", mutation_type_col)
    return()
  }
  
  mutation_df[, mutation_class_col] = mutation.table.df[match(mutation_df[, mutation_type_col], mutation.table.df$Mutation_Type), "Mutation_Class"]
  mutation_df
}

parseProtionChangeColumn <- function(mutation_df, 
                                     protein_change_col = "Protein_Change", 
                                     mutation_type_col = "Mutation_Type", 
                                     mutation_class_col = "Mutation_Class",
                                     amino_acid_position_col = "AA_Position"){
  # check if mutation_df has two columns
  if(!protein_change_col %in% colnames(mutation_df)){
    warning("Undefined column: ", protein_change_col)
    return()
  }
  if(!mutation_type_col %in% colnames(mutation_df)){
    warning("Undefined column: ", mutation_type_col)
    return()
  }
  if(!mutation_class_col %in% colnames(mutation_df)){
    mutation_df <- praseMutationTypeColumn(mutation_df, mutation_type_col, mutation_class_col)
  }
  
  # parse amino acid position
  mutation_df[, amino_acid_position_col] <- apply(mutation_df, 1, function(r){
    pos <- parsePosition(as.character(r[protein_change_col]), as.character(r[mutation_type_col]), as.character(r[mutation_class_col]))
  })
  mutation_df[, amino_acid_position_col] <- as.numeric(mutation_df[, amino_acid_position_col])
  
  # filter out amino_acid_position == NA
  mutation_df <- mutation_df[!is.na(mutation_df[, amino_acid_position_col]), ]
  
  # sort by position
  mutation_df <- mutation_df[order(mutation_df[, amino_acid_position_col]), ]
  
  return(mutation_df)
}

toJSONbyAAPostion <- function(snv_df, outfile = "output.json",
                              amino_acid_position_col = "AA_Position"){

  library(jsonlite, quietly = TRUE)
  # sort by amino acid position
  snv_df <- snv_df[order(snv_df[, amino_acid_position_col]), ]
  
  # split by amino acid position
  t_by_pos = splitByPosition(snv_df, as.numeric(snv_df[, amino_acid_position_col]), amino_acid_position_col)
  
  tjson = toJSON(t_by_pos, pretty = FALSE, auto_unbox = TRUE)
  write(tjson, outfile)
}