const {getAllTopics, getAllEndpoints} = require("../model/model")
module.exports = {getTopics, getApi}

function getTopics(request, response){
    getAllTopics()
   .then((topics)=> {
        response.status(200).send({topics})
    })
}

function getApi(request, response){
    getAllEndpoints()
    .then((result) =>{
        response.status(200).send(result)
    })
}