import { USER_POSTS_PAGE } from '../routes.js'
import { renderHeaderComponent } from './header-component.js'
import {posts, goToPage, getToken, renderApp} from '../index.js'
import { addLike, removeLike, deletePost} from '../api.js'
import { replacerString, getUserFromLocalStorage } from '../helpers.js'
import { formatDistance } from 'date-fns'
import { ru } from 'date-fns/locale'

export function formatPostCreatedAt(createdAt) {
	return formatDistance(new Date(createdAt), new Date(), { locale: ru }) + ' назад';
}

export function renderPostsPageComponent({ appEl }) {
    // TODO: реализовать рендер постов из api
    console.log('Актуальный список постов:', posts)

    /**
     * TODO: чтобы отформатировать дату создания поста в виде "19 минут назад"
     * можно использовать https://date-fns.org/v2.29.3/docs/formatDistanceToNow
     */

    let message = null
		if (posts.length > 0) {
        const getApiPosts = posts.map((postItem) => {
            return {
                postId: postItem.id,
                postImageUrl: postItem.imageUrl,
                postCreatedAt: formatPostCreatedAt(postItem.createdAt),
                description: replacerString(postItem.description),
                userId: replacerString(postItem.user.id),
                userName: replacerString(postItem.user.name),
                userLogin: postItem.user.login,
                postImageUserUrl: postItem.user.imageUrl,
                usersLikes: postItem.likes,
                isLiked: postItem.isLiked,
            }
        })

        message = getApiPosts
            .map((postItem, index) => {
							const isCurrentUserPost = postItem.userId === getCurrentUserId();
                return `
         <li id="post" class="post">
           <div class="post-header" data-user-id="${postItem.userId}">
               <img src="${postItem.postImageUserUrl}" class="post-header__user-image">
               <p class="post-header__user-name">${postItem.userName}</p>
           </div>
           <div class="post-image-container">
             <img class="post-image" data-post-id="${postItem.postId}" src="${postItem.postImageUrl}" data-index="${index}">
           </div>
           <div class="post-likes">
             <button data-post-id="${postItem.postId}"data-like="${postItem.isLiked ? 'true' : ''}" data-index="${index}" class="like-button">
             <img src=${postItem.isLiked
                     ? './assets/images/like-active.svg'
                     : './assets/images/like-not-active.svg'}></button> 
             <p class="post-likes-text">
               Нравится: ${postItem.usersLikes.length > 0
                       ? `${replacerString(postItem.usersLikes[postItem.usersLikes.length - 1].name)}
               ${postItem.usersLikes.length - 1 > 0 ? 'и еще' + (postItem.usersLikes.length - 1) : ''} `
                       : '0'}
             </p>
           </div>
           <p class="post-text"  > 
             <span  class="user-name">${postItem.userName}</span>
						 <span  class="user-description" data-post-id="${postItem.postId}"> ${postItem.description}</span>
           </p>
           <p class="post-date">
             ${postItem.postCreatedAt}
           </p>
					 ${isCurrentUserPost
						? 
								`<button data-post-id="${postItem.postId}" class="delete-button">  <img src="./assets/images/delete.svg" alt="del"></button>`
						
						: ''
				}
         </li> 
      `
            })
            .join('')
    } else {
        message = 'постов пока нет'
    }

    const mainHtml = ` <div class="page-container">
     <div class="header-container"></div>
     <ul class="posts">
      ${message}
     </ul>
  </div>
  `
    appEl.innerHTML = mainHtml

		function getCurrentUserId() {
			const user = getUserFromLocalStorage();
			if (user) {
					return user._id; 
			}
			return null;
	}



    renderHeaderComponent({
        element: document.querySelector('.header-container'),
    })

    document.querySelectorAll('.post-header').forEach((userEl) => {
        userEl.addEventListener('click', () => {
            goToPage(USER_POSTS_PAGE, { userId: userEl.dataset.userId })
        })
    })

    likeEventListener({ token: getToken() })
    likeEventListenerOnIMG({ token: getToken() })
		deleteButtonEventListener({ token: getToken() })
}

export function deleteButtonEventListener({ token }) {
	document.querySelectorAll('.delete-button').forEach((deleteButton) => {
			deleteButton.addEventListener('click', async (event) => {
					event.stopPropagation()
					if(token){
						const postId = deleteButton.dataset.postId
					const index =  posts.findIndex((post) => post.id === postId)
					posts.splice(index, 1)
					deletePost({ postId, token })
					renderApp()
					} 
			})
	})
}

export function likeEventListener() {
    document.querySelectorAll('.like-button').forEach((likeButton) => {
        likeButton.addEventListener('click', async (event) => {
            event.stopPropagation()
            const postId = likeButton.dataset.postId
            const index = likeButton.dataset.index
            const token = getToken()

						if (token) {
            if (posts[index].isLiked) {
                const updatedPost = await removeLike({ token, postId })
                posts[index].isLiked = false
                posts[index].likes = updatedPost.post.likes
            } else {
                const updatedPost = await addLike({ token, postId })
                posts[index].isLiked = true
                posts[index].likes = updatedPost.post.likes
            }
            renderApp()
					} else {
						alert('Пользователь не авторизован. Запрос на лайк не выполнен.');
				}
		});
});
}

export function likeEventListenerOnIMG() {
    document.querySelectorAll('.post-image').forEach((likeButton) => {
        likeButton.addEventListener('click', async (event) => {
            event.stopPropagation()
            const postId = likeButton.dataset.postId
            const index = likeButton.dataset.index
            const token = getToken()
						if (token) {
            if (posts[index].isLiked) {
                const updatedPost = await removeLike({ token, postId })
                posts[index].isLiked = false
                posts[index].likes = updatedPost.post.likes
            } else {
                const updatedPost = await addLike({ token, postId })
                posts[index].isLiked = true
                posts[index].likes = updatedPost.post.likes
            }
            renderApp()
					} else {
						alert('Поставить лайк могут только авторизованные пользователи')
				}
		});
});
}
