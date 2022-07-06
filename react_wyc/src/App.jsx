import { useState } from 'react'
import { useEffect } from 'react'
import logo from './logo.svg'
import './App.css'

function App() {
  const [posts, setPosts] = useState([])
  const basicURL = "https://hacker-news.firebaseio.com/v0/";
  useEffect(() => {
    fetch(`${basicURL}topstories.json?print=pretty`).then(res => res.json()).then(json => {
      const list = json.slice(0, 10)
      const posts = Promise.all(list.map(id => fetch(`${basicURL}item/${id}.json?print=pretty`).then(res => res.json())))
      return posts
    }).then(posts => setPosts(posts))
  }, [])


  return (
    <div className='news-list'>
      <ul>{posts.map((post, index) =>
        <li className='news-item' key={index}>
         


          <span className="score">{post.score}</span>
          <span className="title">
            <a href={post.url} target="_blank" rel="noopener">{post.title}</a>
            
            <span className="host">{post.url===undefined ? null : `(${new URL(post.url).host})`}</span>
            
          </span>
          <br /> 
          <span className="meta">
            <span className="by">by {post.by} </span>
            <span className="time">{Math.floor(((new Date().getTime()/1000)-post.time)/3600)} hours ago</span>
            <span className="comments-link">|<a href="/item/31996235" className="">{post.kids===undefined ? null : `${post.kids.length}`} comments</a></span>
          </span>



        </li>)}
      </ul>
    </div>
  )
}

export default App
