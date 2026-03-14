const router = require("express").Router()
const metrics = require("../monitor/metrics")

router.get("/stats",(req,res)=>{

 const stats = metrics.getStats()

 res.json(stats || {
   total_hashed:0,
   total_errors:0
 })

})

module.exports = router