import{glob as w}from"glob";import*as a from"fs";import*as t from"path";import*as c from"xml2js";import{cli as S}from"cleye";var r=S({name:"transpile-iconify",parameters:["<svg-path>"],help:{description:"Transform SVG files into JSON format for Iconify",examples:["transpile-iconify ./path/to/icons/**/*.svg","transpile-iconify ./path/to/icons/**/*.svg --output=icons.json","transpile-iconify ./path/to/icons/**/*.svg --output=icons.json --prefix=iconify"],usage:"transpile-iconify <svg-path> [options]",version:"0.0.3"},flags:{output:{type:String,description:"Output JSON filename",default:"icons.json"},prefix:{type:String,description:"Prefix for the icons"}}});async function x(f,l,g){let m=await w(f),s={};for(let n of m){let h=await a.promises.readFile(n,"utf8"),o=(await new c.Parser().parseStringPromise(h)).svg;delete o.$;let u=o.path?.map(e=>e.$).map(e=>`<path d="${e.d}" fill="currentColor"/>`).join(`
`)||"",d=o.$?.width||24,v=o.$?.height||24,y=t.basename(n,".svg"),i=g||t.basename(t.dirname(n));s[i]||(s[i]={prefix:i,icons:{}}),s[i].icons[y]={body:u,width:parseInt(d),height:parseInt(v)}}let p=t.join(process.cwd(),l);await a.promises.writeFile(p,JSON.stringify(s,null,2),"utf8"),console.log(`All SVG files have been transformed into ${p}`)}x(r._.svgPath,r.flags.output,r.flags.prefix);
