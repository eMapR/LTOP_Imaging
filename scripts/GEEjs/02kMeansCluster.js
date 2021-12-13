//######################################################################################################## 
//#                                                                                                    #\\
//#                                         LANDTRENDR LIBRARY                                         #\\
//#                                                                                                    #\\
//########################################################################################################


// date: 2020-12-10
// author: Peter Clary    | clarype@oregonstate.edu
//         Robert Kennedy | rkennedy@coas.oregonstate.edu
// website: https://github.com/eMapR/LT-GEE

//  This program takes a dataset of independent patches of pixels and links patches that are spectrally 
//  similar. The independent patches are derived from a SNIC algorithm, which groups pixels around a seed 
//  pixel that is spectrally similar. These patches are then linked using a K-Means clustering algorithm. 
//  In essence, we are putting the patches into clusters; like sorting clusters of different colored grapes. 
//  Each of the clusters is given a unique cluster ID so we can keep track of them.


//////////////////////////////////////////////////////////
//////////////////Import Modules ////////////////////////////
////////////////////////// /////////////////////////////

var ltgee = require('users/emaprlab/public:LT-data-download/LandTrendr_V2.4.js'); 

//////////////////////////////////////////////////////////
/////////////////point sample ////////////////////////////
///////////////////////////////////////////////////////

var sample = ee.FeatureCollection("users/emaprlab/SERVIR/v2/snic_seed_pixels_points_attributed_randomSubset_75k");
Map.addLayer(sample)
//////////////////////////////////////////////////////////
/////////////////////Cambodia vector////////////////////////////
////////////////////////// /////////////////////////////

//Centers the map on spatial features 
var table = ee.FeatureCollection("users/emaprlab/SERVIR/v1/Cambodia");
var aoi = table.geometry().buffer(5000);

//////////////////////////////////////////////////////////
////////////////////params//////////////////////////
////////////////////////// /////////////////////////////

var startDate = '11-20'; 
var endDate =   '03-10'; 
var masked = ['cloud', 'shadow'] // Image masking options ie cloud option tries to remove clouds from the imagery. powermask in new and has magic powers ... RETURN TO THIS AND ADD MORE DETAIL

/////////////////////////////////////////////////////////
////////////////////////Landsat Composites///////////////////////////////
/////////////////////////////////////////////////////////

var image2020 = ltgee.buildSRcollection(2020, 2020, startDate, endDate, aoi, masked).mosaic()
var image2010 = ltgee.buildSRcollection(2010, 2010, startDate, endDate, aoi, masked).mosaic()
var image2000 = ltgee.buildSRcollection(2000, 2000, startDate, endDate, aoi, masked).mosaic()

var LandsatComposites = image2020.addBands(image2010).addBands(image2000)

//////////////////////////////////////////////////////////
////////////////////SNIC/////////////////////////////
///////////////////////////////////////////////////////

var snicImagey = ee.Algorithms.Image.Segmentation.SNIC({
  image: LandsatComposites,
  size: 10, //changes the number and size of patches 
  compactness: 1, //degrees of irregularity of the patches from a square 
  }).clip(aoi);
  
//////////////////////////////////////////////////////////
////////////////////SNIC/////////////////////////////
///////////////////////////////////////////////////////

var CambodiaSNIC_v1_QA = ee.Image("users/emaprlab/SERVIR/v2_QAofv1/CambodiaSNIC_v1_QA");

var patchRepsMean = snicImagey.select(["seeds", "clusters",  "B1_mean", "B2_mean",  "B3_mean",  "B4_mean",  "B5_mean",  "B7_mean",  "B1_1_mean",  "B2_1_mean",  "B3_1_mean",  "B4_1_mean",  "B5_1_mean","B7_1_mean",  "B1_2_mean",  "B2_2_mean",  "B3_2_mean",  "B4_2_mean",  "B5_2_mean",  "B7_2_mean"]);

var patchRepSeeds = snicImagey.select(['seeds']);

///////////////////////////////////////////////////////
///////Select singel pixel from each patch/////////////
///////////////////////////////////////////////////////

var SNIC_means_image = patchRepSeeds.multiply(patchRepsMean).select(["B1_mean", "B2_mean",  "B3_mean",  "B4_mean",  "B5_mean",  "B7_mean",  "B1_1_mean",  "B2_1_mean",  "B3_1_mean",  "B4_1_mean",  "B5_1_mean","B7_1_mean",  "B1_2_mean",  "B2_2_mean",  "B3_2_mean",  "B4_2_mean",  "B5_2_mean",  "B7_2_mean"],["seed__3",  "seed__4",  "seed__5",  "seed__6",  "seed__7",  "seed__8",  "seed__9",  "seed__10",  "seed__11",  "seed__12","seed__13",  "seed__14",  "seed__15",  "seed__16",  "seed__17",  "seed__18",  "seed__19", "seed__20"])//.reproject({  crs: 'EPSG:4326',  scale: 30});//.clip(aoi)

//////////////////////////////////////////////////////////
/////////////////Train////////////////////////////
///////////////////////////////////////////////////////

var training = ee.Clusterer.wekaCascadeKMeans(5000,5001).train({ 
  features: sample, 
  //inputProperties:["B1_mean", "B2_mean",  "B3_mean",  "B4_mean",  "B5_mean",  "B7_mean",  "B1_1_mean",  "B2_1_mean",  "B3_1_mean",  "B4_1_mean",  "B5_1_mean","B7_1_mean",  "B1_2_mean",  "B2_2_mean",  "B3_2_mean",  "B4_2_mean",  "B5_2_mean",  "B7_2_mean"]
  inputProperties:["seed__3",  "seed__4",  "seed__5",  "seed__6",  "seed__7",  "seed__8",  "seed__9",  "seed__10",  "seed__11",  "seed__12","seed__13",  "seed__14",  "seed__15",  "seed__16",  "seed__17",  "seed__18",  "seed__19", "seed__20"]
});

////////////////////////////////////////
////////////////////Clusterer//////////////
////////////////////////////////////////

var clusterSeed = SNIC_means_image.cluster(training).clip(aoi);

////////////////////////////////////
////////////////Kmeans cluster Export//////////////
////////////////////////////////////

Export.image.toDrive({
        image:clusterSeed, 
        description: 'servir_cambodia_snic_seed_points75k_kmeans_5k_cluster_seeds', 
        folder:'servir_cambodia_snic_seed_points75k_kmeans_5k_cluster_seeds', 
        fileNamePrefix: "servir_cambodia_snic_seed_points75k_kmeans_5k_cluster_seeds", 
        region:aoi, 
        scale:30, 
        maxPixels: 1e13 
})   


Map.centerObject(aoi)

