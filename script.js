const urlSearch = new URLSearchParams(window.location.search);
    
const username = urlSearch.get("user");

let user,repos;

let page=1;
let repo_per_page=10;

window.onload= ()=>{

    fetchUser(username)
    .then(()=>{
        fetchRepos(username);

    })
    
}

document.getElementById("records-per-page").addEventListener('change',(e)=>{
    setTimeout(()=>changePerPage(e.target.value),500);
})

function handleUserNotFound(condition) {
    // Redirect to index.html with a message in the URL

    let message;
    if(condition==0 ) message = 'Error in Github Api. Please try again after some time';
    else if(condition==1 ) message = 'User not found. Please enter a valid GitHub username.';
    
    const redirectUrl = `index.html?message=${encodeURIComponent(message)}`;
    window.location.href = redirectUrl;
}

function fetchUser(userName){
    
    const loading = document.getElementById('loading');
    const data_body = document.getElementById('data-body');

    
    return fetch(`https://api.github.com/users/${userName}`)
    .then(response => {
        if (!response.ok) {
            handleUserNotFound(1);
        }
        return response.json();
    })
    .then(result => {
        user=result;
        renderUser();
        console.log(user);
        loading.setAttribute('style','display: none !important')
        data_body.setAttribute('style','display: block');
    })
    .catch(error => {
        handleUserNotFound(1);
    });
}

function fetchRepos(userName){
    fetch(`https://api.github.com/users/${userName}/repos?page=${page}&per_page=${repo_per_page}`)
    .then(response => {
        if (!response.ok) {
            handleUserNotFound(1);
        }
        return response.json();
    })
    .then(result => {
        
        repos=result;

        if(repos.length<1){
            document.querySelector("#repo-list").innerHTML=
            `<h1 class="h1 text-center my-3">No Repos found</h1>`
        }else{
            renderRepos();
            renderPageList();
        }

        console.log(repos);
    })
    .catch(error => {
        console.error('Error fetching user information:', error);
    });
}

function changePerPage(per_page){
    repo_per_page=per_page;
    console.log(repo_per_page);
    fetchRepos(username);
}


function renderUser(){
    document.getElementById("image").src=user.avatar_url;
    document.getElementById("name").innerHTML=user.name;
    document.getElementById("github-link").href=user.html_url
    document.getElementById("github-link").innerHTML=user.html_url
    
    if(user.bio){
        document.getElementById("bio").innerHTML=`Bio : ${user.bio}`;
    }else{
        document.getElementById("bio").innerHTML="Bio not available";
    }
    
    if(user.location){
        document.getElementById("location").innerHTML=`Bio : ${user.location}`;
    }else{
        document.getElementById("location").innerHTML="Location not available";
    }
    
    if(user.twitter_username){
        document.getElementById("twitter").innerHTML=`https://twitter.com/${user.twitter_username}`;
        document.getElementById("twitter").href=`https://twitter.com/${user.twitter_username}`;
    }else{
        document.getElementById("links").innerHTML="Twitter : Not available";
    }
}

function handlePageChange(event) {
    // Retrieve the data-value attribute of the clicked <li> element
    const dataValue = event.currentTarget.getAttribute('data-value');
    let pages=Math.ceil(user.public_repos/repo_per_page);

    if(dataValue=="next"){
        if(page==pages) return;

        page+=1;
    }
    else if(dataValue=="prev"){
        if(page==1) return;

        page-=1;
    }
    else{
        page=Number(dataValue);
    }

    fetchRepos(username);

    console.log('Clicked item with data-value:', dataValue);
}

function renderPageList(){
    let pages=Math.ceil(user.public_repos/repo_per_page);
    console.log(pages);

    let pageList=[];

    let startPage= (page-2) < 1 ? 1 : page-2
    let endPage= (startPage+4) <= pages ? (startPage+4) : page+(pages-page);

    if(endPage < page+2 ) startPage -= page+2 - pages;

    for(let i=startPage-1;i<endPage;i++) {
        pageList[i]=`<li class="page-item page-link no ${(i == page-1) ? "selected-page" : "" }" data-value="${i+1}"  onclick="handlePageChange(event)">${i+1}</li>`
    }

    pageList=pageList.join(' ');

    document.getElementById("page-list").innerHTML=
    `
        <li class="page-item page-link ${(page==1) ? "disabled" : "" }" data-value="prev" onclick="handlePageChange(event)">Previous</li> 
        ${pageList}
        <li class="page-item page-link ${(page==pages) ? "disabled" : "" }" data-value="next" onclick="handlePageChange(event)">Next</li>
    `
}

function renderRepos(){
    const list=repos.map(repo=>{
        let left=0;
        if(repo.topics.length > 3){
            left=repo.topics.length-3;
            repo.topics=repo.topics.slice(0,3);
        }
        return `
            <div class="col-xxl-4 col-md-6 col-12 d-flex">
                <div class="card h-100 w-100">
                    <div class="card-body">
                        <h5 class="card-title">${repo.name}</h5>
                        <p class="card-text">${repo.description}</p>
                        ${(repo.topics.length!=0) ? 
                            `<div class="topics">
                                ${repo.topics.map(topic=>{
                                    return `<span class=" bg-primary text-white p-2 fs-6 rounded" style="width:min-content !important;">${topic}</span>`
                                }).join(' ')}
                                ${(left > 0) ? 
                                    `<span class="bg-primary text-white p-2 rounded" style="width:min-content !important;">${left}+</span>` : ``
                                }
                            </div>` : ``
                        }

                    </div>
                </div>
            </div>
        `
    })

    document.querySelector("#repo-list").innerHTML=
    `
        <h2 class="h2 my-3 text-center"><u>Repositories</u></h2>
        <div class="row gy-3">
            ${list.join(' ')}
        </div>

    `

    
}