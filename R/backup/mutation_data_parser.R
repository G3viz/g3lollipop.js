#rm(list=ls())
#options(stringsAsFactors = FALSE)

# ===================================
firstNonEmpty = function(instr){
  for(e in instr){
    if(e != ""){
      return(e);
    }
  }
}

parsePosition = function(pos_str, mut_type, to_parse){
  if(!to_parse) return(-1)
  
  library(stringr)
  
  cln_str = firstNonEmpty(strsplit(pos_str, "\\*")[[1]])
  p_pos = as.numeric(str_extract_all(cln_str, "[0-9]+")[[1]])
  
  if(length(p_pos) == 1 && is.na(p_pos[1])){
    return(NA)
  } else{
    return(round(mean(p_pos)))
  }
}

# ===================================
file.name = "tp53_mskcc.tsv"
in.dat = read.csv(file.name, header=TRUE, sep="\t")
short.dat = in.dat[, c("Cancer.Type", "Mutation.Type", "Protein.Change")]

mutation.table.file = "mutation_table.csv"
mutation.table.df = read.csv(mutation.table.file, header=TRUE)

# ===================================
short.dat$Mutation.class = mutation.table.df[
  match(short.dat$Mutation.Type, mutation.table.df$Mutation.Type), "Mutation.Class"]

short.dat$need.parse.position = mutation.table.df[
  match(short.dat$Mutation.Type, mutation.table.df$Mutation.Type), "need.parse.position"]

short.dat = subset(short.dat, need.parse.position)
short.dat$Mutation.class = factor(short.dat$Mutation.class)

# ===================================
short.dat$Protein.position =  NA

for(i in 1:nrow(short.dat)){
  pos_str = as.character(short.dat[i, "Protein.Change"])
  mut_type = as.character(short.dat[i, "Mutation.Type"])
  to_parse = short.dat[i, "need.parse.position"]
  
  short.dat[i, "Protein.position"] = parsePosition(pos_str, mut_type, to_parse)
}

short.dat = short.dat[, c("Cancer.Type", "Mutation.Type", "Protein.Change", "Mutation.class", "Protein.position")]

#                         Cancer.Type     Mutation.Type Protein.Change Mutation.class Protein.position
#1 Uterine Undifferentiated Carcinoma Missense_Mutation          R273C       Missense              273
#2     Uterine Endometrioid Carcinoma Missense_Mutation          R273C       Missense              273
#3       Anal Squamous Cell Carcinoma Missense_Mutation          R273C       Missense              273
#4               Colon Adenocarcinoma Missense_Mutation          R273C       Missense              273
#5              Rectal Adenocarcinoma Missense_Mutation          R273C       Missense              273
#6            Glioblastoma Multiforme Missense_Mutation          R273C       Missense              273

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

# ==========
# sort by "Mutation.class" and "Protein.position"
short.dat = short.dat[with(short.dat, order(Mutation.class, Protein.position)), ]

t_by_class = splitByFactor(short.dat, short.dat$Mutation.class)

t_by_class_by_pos = lapply(t_by_class, function(chunk){
  splitByPosition(chunk$value, as.numeric(chunk$value$Protein.position), c("Mutation.class", "Protein.position"))
})

# ===========
short.dat = short.dat[with(short.dat, order(Protein.position)), ]
t_by_pos = splitByPosition(short.dat, as.numeric(short.dat$Protein.position), "Protein.position")

# ===========
final_list = list(all = t_by_pos, byMutationClass = t_by_class_by_pos)

# ===========
library(jsonlite)

tjson = toJSON(t_by_pos, pretty=TRUE, auto_unbox=TRUE)
write(tjson, "tp53.json")
tjson = toJSON(final_list, pretty = FALSE, auto_unbox = TRUE)
write(tjson, "tp53_all_mutation_types.json")

# =============
