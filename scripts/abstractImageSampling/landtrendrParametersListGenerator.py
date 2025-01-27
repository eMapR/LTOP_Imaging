#imports 
import pandas as pd	


# This script is designed to create a list of landTrendr parameters varations. The parameter varations 
# are drawn from lists of parameter values.


# output file path (txt file)
outFile = ""

# list of parameter confingations
Segments = [6,8,10,11]
#Segments = [6,9,11]
spike = [0.75,0.90,1.0]
#spike = [0.75,0.90,1.0]
recovery = [0.25,0.50,0.90,1.0]
#recovery = [0.25,0.65,1.0]
pValue = [0.05,0.10,0.15]

list = []
for seg in Segments:
    for ske in spike:
        for rec in recovery:
            for pv in pValue:
                newlist = [seg,ske,rec,pv]
                list.append(newlist)
                print('newlist', newlist)




# make empty list. this will parameters appended to it
parameterDicList = []
counter = 1
counter_list = []

# iterator 
for subList in list:


# asign each parameter to template 
    ltParamTemplate = "{timeSeries: ee.ImageCollection([]), maxSegments: "+str(subList[0])+" , spikeThreshold: "+str(subList[1])+", vertexCountOvershoot: 3, preventOneYearRecovery: true, recoveryThreshold: "+str(subList[2])+", pvalThreshold: "+str(subList[3])+", bestModelProportion: 0.75, minObservationsNeeded: "+str(subList[0])+" }"

# append completed parameters dicionary to emtpy list 
    parameterDicList.append(ltParamTemplate)
    counter_list.append(counter)
    counter += 1

# end iterator 
print(parameterDicList)

df = pd.DataFrame(zip(counter_list, parameterDicList),columns =['Param_num', 'Parameter'])

df.to_csv("./param_varation.csv", index=False)

# add list to text file
#with open("./LT_parameter_varations_list_dic_144.txt", "w") as output:
#    output.write(str(parameterDicList))

#export file
