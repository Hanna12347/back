import express from "express";
import proverbs from "./proverbs.js";
import { createEngine } from 'express-react-views';
import path from "path";
import { fileURLToPath } from 'url';
import methodOverride from 'method-override';
import cors from "cors"
 

const app = express();
app.use(cors());
const PORT= process.env.PORT || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
await import('@babel/register').then(babelRegister => {
  babelRegister.default({
    presets: ['@babel/preset-react'],
    extensions: ['.jsx']
  });
});
// middleware
app.use(express.urlencoded ({ extended:true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.use(methodOverride('_method'));
app.set('views', path.join(__dirname, '../frontend/src'));
app.set("view engine","jsx");
app.engine('jsx', createEngine({
  beautify: true,
  transformViews: false,
  babel: {
    presets: ['@babel/preset-react'],
    plugins: []
  }
}));
app.use(express.json());
app.get("/",(req,res)=>{
    res.render('Index', { proverbs });
})

app.get("/proverbs/random", (req, res) => {
    const randomIndex = Math.floor(Math.random() * proverbs.length);
    const randomProverb = proverbs[randomIndex];
    res.render("Random",{ randomProverb })
});
app.get("/addproverb", (req, res) => {
    res.render("Formcreation");
});
app.post("/proverbs/creation",(req,res)=>{
    const { textDeutsch,textEnglish,translation,meaning }=req.body;
    if (!textDeutsch || !textEnglish || !meaning){
        return res.status(400).json({ error: "Missing required fields" });
    };
    const id = proverbs.length > 0 ? Math.max(...proverbs.map(p => p.id)) + 1 : 1;
    const newproverb = {id,textDeutsch,textEnglish,translation:translation|| "",meaning}
    proverbs.push(newproverb);
    res.redirect("/");
    
});
app.get("/updateform/:id",(req,res)=>{
  const proverbId = parseInt(req.params.id);
  const proverbIndex = proverbs.findIndex(p => p.id === proverbId);
  const choosen=proverbs[proverbIndex]
  res.render("Formcreation",{ choosen });
})
app.patch("/update/:id",(req,res)=>{
  const proverbId = parseInt(req.params.id);
  const proverbIndex = proverbs.findIndex(p => p.id === proverbId);
  const updates = req.body;
  if (!updates || Object.keys(updates).length === 0) {
    return res.status(400).json({ error: "No updates provided" });
  }
  proverbs[proverbIndex] = {
    ...proverbs[proverbIndex],  // Keep existing data
    ...updates                  // Apply new updates
  };
})
app.post("/delete/:id",(req,res)=>{
  const proverbId = parseInt(req.params.id);
  const proverbIndex = proverbs.findIndex(p => p.id === proverbId);
  
  if (proverbIndex === -1) {
    return res.status(404).send('Proverb not found');
  }

  proverbs.splice(proverbIndex, 1);
  res.redirect('/'); 
})
app.listen(PORT,()=>{
    console.log("your server is runnig on port",PORT)
})