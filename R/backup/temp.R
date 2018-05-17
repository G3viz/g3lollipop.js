

# ===================================
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
