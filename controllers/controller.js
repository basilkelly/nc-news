const {getAllTopics} = require("../model/model")
module.exports = {getTopics}

function getTopics(request, response){
    getAllTopics()
   .then((topics)=> {
        response.status(200).send({topics})
    })
}