var conn = require('../../../utils/dao');
var ObjectID = require('mongodb').ObjectId;
var _db;
class Swot{
  swotColl =null;
  constructor(){
    this.initModel();
  }
  async initModel(){
     try {
      _db = await conn.getDB();
       this.swotColl = await _db.collection("SWOT");
    }catch(ex){
      console.log(ex);
      process.exit(1);
    }
  }
  async getAll(id){
    const filter = {"user_id": new Object(id)};
    let swots = await this.swotColl.find({filter});
    return swots.toArray();
  }

  async getWithFilterAndProjection(filter, projection){
    let p = {
      "projection": projection
    }
    let swots = await this.swotColl.find(filter, p);
    return swots.toArray();
  }

  async updateRelevanceRandom(id){
    const filter = {"_id": new ObjectID(id)};
    const updateAction = {"$set": {swotRelevance: Math.round(Math.random()*100)/100}};
    let result = await this.swotColl.updateOne(filter, updateAction);
    return result;
  }

  async getByType(type, userId){
    const filter = {"swotType": type, "user_id": new ObjectID(userId)};
    let cursor = await this.swotColl.find(filter);
    return cursor.toArray();
  }

  async getByMeta(meta, userId){
    const filter = {"swotMeta":meta, "user_id": new ObjectID(userId)};
    let cursor = await this.swotColl.find(filter);
    return cursor.toArray();
  }

  async getByFacet(textToSearch, page, itemsPerPage, userId){
    const filter = {swotDesc: RegExp(textToSearch, 'g'), "user_id": new ObjectID(userId)};
    /*const options = {
      projection: {},
      limit: itemsPerPage,
      skip: (itemsPerPage * (page - 1))
    };*/
    let cursor = await this.swotColl.find(filter);
    let docsMatched = await cursor.count();
    cursor.skip((itemsPerPage * (page - 1)));
    cursor.limit(itemsPerPage);
    let documents = await cursor.toArray();
    
    return {
      docsMatched,
      documents,
      page,
      itemsPerPage
    };
  }

  async getByDesc(desc){
    const filter = {"swotDesc":desc};
    let cursor = await this.swotColl.find(filter);
    return cursor.toArray();
  }

  async addNew(swotType, swotDesc, swotMetaArray, id){
    let newSwot = {
      swotType, 
      swotDesc, 
      swotMeta: swotMetaArray,
      swotDate: new Date().getTime(),
      swotRelevance: 0,
      user_id: new Object(id)
    }
    let result = await this.swotColl.insertOne(newSwot);
    return result;
  }

  async getid(id){
    const filter = {"_id": new ObjectID(id)};
    let swotDocument = await this.swotColl.findOne(filter);
    return swotDocument;
  }

  async addMetaToSwot(swotMetaKey, id){
    // Update swot set swotMeta = "Nuevo Valor" where _id = "aId"

    let filter = {"_id": new ObjectID(id)};
    let updateJson = {
      "$push" : {"swotMeta": swotMetaKey}
    };
    let result = await this.swotColl.updateOne(filter, updateJson);
    return result;
  }

  async deleteById(id){
    let filter = {"_id": new ObjectID(id)};
    let result = await this.swotColl.deleteOne(filter);
    return result;
  }

  async getAggregatedData(userId){
    const PipeLine = [
      {
        '$match': {
          'user_id': new ObjectID(userId)
        }
      }, {
        '$group': {
          '_id': '$swotType', 
          'swotTypeCount': {
            '$sum': 1
          }
        }
      }, {
        '$sort': {
          '_id': 1
        }
      }
    ];
    const cursor = this.swotColl.aggregate(PipeLine);
    return await cursor.toArray();
  }
}

module.exports = Swot;