import { useEffect } from 'react'
import { useState } from 'react'
import Ajv, { JSONSchemaType } from "ajv"

const ajv=new Ajv({
    int32range:false
});
type Metadata = {
    title: string, url?: string, time: number, by: string, kids?: number[],score:number
}
export default function List(){
    const [posts, setPosts] = useState<Metadata[]>([])

  useEffect(() => {
    fetch("https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty").then(res => res.json()).then(json=>{
        type IDArray = Array<number>
        const schema: JSONSchemaType<IDArray> = {
            type: "array",
            items: {
                type: "integer"
            }
        }
        const validator = ajv.compile(schema)
        if (validator(json)) return json
        else throw new Error("Invalid data")
    }).then(json=>{
        const list = json.slice(0, 10)
        const posts = Promise.all(list.map(id => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`).then(res => res.json())))
        return posts
    }).then(posts=>{
        const schema: JSONSchemaType<Metadata[]> ={
            type:"array",
            items:{
                type:"object",
            properties:{
                title:{
                    type:"string"
                },
                url:{
                    type: "string",
                    nullable:true
                },
                by:{
                    type: "string"
                },
                time: {
                    type: "integer"
                },
                kids: {
                    type: "array",
                    items: {
                        type: "integer"
                    },
                    nullable: true
                },
                score:{
                    type:"integer"
                }
            },
            required: ["by", "time", "title","score"]
            }
        }
        const validator = ajv.compile(schema)
        if (validator(posts)) return posts
        else {
            console.log(validator.errors)
            throw new Error("Invalid data")

        }
    }).then(posts => setPosts(posts))
    .catch(err => console.error(err))
  }, [])
  return <ul >
     {posts.map((post, index) =>
          <ListItem post={post} key={index} />)}
  </ul>
}
function ListItem(props:{post:Metadata}){
    const post=props.post
    return (<li className='news-item'>
        <span className='score'>{post.score}</span>
        <Title url={post.url} title={post.title}/>
        <br />
        <Meta time ={post.time} by={post.by} kids={post.kids}/>
    </li>)
}
function Title(props:{url ? :string,title:string}) {
    const {url,title}=props
    return <span className='code'>
        <a href={url}>{title}</a>
        <span className='host'>{url===undefined? null:`(${new URL(url).host})`}</span>
    </span>
    
}
function Meta(props:{by:string,time:number,kids?:number[]}){
  const {by,time,kids}=props
  const now=Math.floor(new Date().getTime()/1000)
  return <span className='meta'>
    <span>by</span>
    <a href='#' >{by}</a>
    <span>{`${now-time} seconds ago |`}</span>
    <a href="#">{kids===undefined? `0 comment`:`${kids.length} comments`}</a>
  </span>
}