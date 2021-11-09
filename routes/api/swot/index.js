const { parse } = require('dotenv');
var express = require('express');
var router = express.Router();
var SwotDao = require('./swot.dao');
var Swot = new SwotDao();

//Get all
router.get('/all', async (req, res, next)=>{
  try{
    const allSwotEntries = await Swot.getAll(req.user._id);

    //console.log(req.user);
    return res.status(200).json(allSwotEntries);
  }catch(ex){
    console.log(ex);
    return res.status(500).json({msg:"Error al procesar petición"});
  }
});

//Get by type
router.get('/bytype/:type', async (req, res, next) =>{
  try{
    const {type} = req.params;
    const swots = await Swot.getByType(type, req.user._id);
    return res.status(200).json(swots);
  }catch(ex){
    console.log(ex);
    return res.status(500).json({msg:"Error al procesar petición"});
  }
});

//Get by meta
router.get('/bymeta/:meta', async (req, res, next) =>{
  try{
    const {meta} = req.params;
    const swots = await Swot.getByMeta(meta, req.user._id);
    return res.status(200).json(swots);
  }catch(ex){
    console.log(ex);
    return res.status(500).json({msg:"Error al procesar petición"});
  }
});

router.get('/byrelevancerange/:lower/:upper/:extremes', async (req, res, next) =>{
  try{
    const {lower, upper, extremes} = req.params;
    const filter = (parseInt(extremes) > 0) ?  {
      swotRelevance: {
        "$gte": parseFloat(lower),
        "$lte": parseFloat(upper),
      }
    }
    :
    {
      swotRelevance: {
        "$gt": parseFloat(lower),
        "$lt": parseFloat(upper),
      }
    };
    const swots = await Swot.getWithFilterAndProjection(filter, {});
    return res.status(200).json(swots);
  }catch(ex){
    console.log(ex);
    return res.status(500).json({msg:"Error al procesar petición"});
  }
});

//Aggregate Data
router.get('/dashboard', async (req, res, next) =>{
  try{
    const swots = await Swot.getAggregatedData(req.user._id);
    return res.status(200).json(swots);
  }catch(ex){
    console.log(ex);
    return res.status(500).json({msg:"Error al procesar petición"});
  }
});

//Get by desc
router.get('/bydesc/:desc', async (req, res, next) =>{
  try{
    const {desc} = req.params;
    const swots = await Swot.getByDesc(desc);
    return res.status(200).json(swots);
  }catch(ex){
    console.log(ex);
    return res.status(500).json({msg:"Error al procesar petición"});
  }
});

//New
router.post('/new', async (req, res, next) =>{
  try{
    const {
      swotType,
      swotDesc,
      swotMeta
    } = req.body;
    
    const swotMetaArray = swotMeta.split('|');

    //validaciones
    const result = await Swot.addNew(swotType, swotDesc, swotMetaArray, req.user._id);

    console.log(result);
    res.status(200).json({msg:"Agregado exitosamente"});

  }catch (ex){
    console.log(ex);
    return res.status(500).json({msg:"Error al procesar petición"});
  }
});

//Get by ID
router.get('/getid/:id', async (req, res, next) =>{
  try{
    const {id} = req.params;
    const SwotEntry = await Swot.getid(id);
    return res.status(200).json(SwotEntry);
  }catch(ex){
    console.log(ex);
    return res.status(500).json({msg:"Error al procesar petición"});
  }
});

//Update by ID
router.put('/update/:id', async (req, res, next) =>{
  try{
    const {id} = req.params;
    const {swotMetaKey} = req.body;
    const result = await Swot.addMetaToSwot(swotMetaKey, id);
    console.log(result);
    return res.status(200).json({msg:"Actualizado"});
  }catch(ex){
    console.log(ex);
    return res.status(500).json({msg:"Error al actualizar"});
  }
});

//Delete by ID
router.delete('/delete/:id', async (req, res, next) =>{
  try{
    const {id} = req.params;
    const result = await Swot.deleteById(id);
    console.log(result);
    return res.status(200).json({msg:"Eliminado"});
  }catch(ex){
    console.log(ex);
    return res.status(500).json({msg:"Error al eliminar"});
  }
});

router.get('/fix', async (req, res, next) =>{
  try{
    let swots = await Swot.getWithFilterAndProjection(
      {},
      {_id:1, swotRelevance:1}
    );
    swots.map( async (o) => {
      await Swot.updateRelevanceRandom(o._id);
    });
    return res.status(200).json(swots);
  }catch(ex){
    console.log(ex);
    return res.status(500).json({msg:"Error al procesar petición"});
  }
});

router.get('/facet/:page/:items/:text', async (req, res, next) =>{
  try{
    let {page, items, text} = req.params;
    page = parseInt(page) || 1;
    items = parseInt(items) || 10;
    
    const swots = await Swot.getByFacet(text, page, items, req.user._id);
    return res.status(200).json(swots);
  }catch(ex){
    console.log(ex);
    return res.status(500).json({msg:"Error al procesar petición"});
  }
});

module.exports = router;