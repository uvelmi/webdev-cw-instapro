// Замени на свой, чтобы получить независимый от других набор данных.
// "боевая" версия инстапро лежит в ключе prod


import { setPosts } from "./index.js";

// const personalKey = "prod";
// const baseHost = "https://webdev-hw-api.vercel.app";

const personalKey = "elena_uvarova1";
const baseHost = "https://webdev-api.sky.pro";

const postsHost = `${baseHost}/api/v1/${personalKey}/instapro`;

export function getPosts({ token }) {
  return fetch(postsHost, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }

      return response.json();
    })
    .then((data) => {
      return data.posts;
    });
}

// https://github.com/GlebkaF/webdev-hw-api/blob/main/pages/api/user/README.md#%D0%B0%D0%B2%D1%82%D0%BE%D1%80%D0%B8%D0%B7%D0%BE%D0%B2%D0%B0%D1%82%D1%8C%D1%81%D1%8F
export function registerUser({ login, password, name, imageUrl }) {
  return fetch(baseHost + "/api/user", {
    method: "POST",
    body: JSON.stringify({
      login,
      password,
      name,
      imageUrl,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Такой пользователь уже существует");
    }
    return response.json();
  });
}

export function loginUser({ login, password }) {
  return fetch(baseHost + "/api/user/login", {
    method: "POST",
    body: JSON.stringify({
      login,
      password,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Неверный логин или пароль");
    }
    return response.json();
  });
}

// Загружает картинку в облако, возвращает url загруженной картинки
export function uploadImage({ file }) {
  const data = new FormData();
  data.append("file", file);

  return fetch(baseHost + "/api/upload/image", {
    method: "POST",
    body: data,
  }).then((response) => {
    return response.json();
  });
}


export async function addPost({ token, imageUrl }) {
  const commentValue = document.getElementById('description').value;
	if (!commentValue.trim() || !imageUrl.trim()) {
    alert('Нет фото или описания');
    return null;
  }

  const response = await fetch(postsHost, {
    method: 'POST',
    body: JSON.stringify({ description: commentValue, imageUrl }),
    headers: { Authorization: token },
  });

  return response.json();
}


// Функция для получения постов пользователя
export async function getUserPosts({ token, userId }) {
  try {
    const response = await fetch(`${postsHost}/user-posts/${userId}`, {
      method: 'GET',
      headers: { Authorization: token },
    });

    if (response.status === 401) {
      throw new Error('Нет авторизации');
    }
    const data = await response.json();
    setPosts(data.posts);
    return data.posts;
  } catch (error) {
    alert('У вас сломался интернет, попробуйте позже');
    console.warn(error);
    return null;
  }
}


export function addLike({ token, postId }) {
  return fetch(`${postsHost}/${postId}/like`, {
      method: 'POST',
      headers: {
          Authorization: token,
      },
  }).then((response) => {
      if (response.status === 401) {
          alert('Поставить лайк могут только авторизованные пользователи')
          throw new Error('Нет авторизации')
      }
      return response.json()
  })
}
export function removeLike({ token, postId }) {
  return fetch(`${postsHost}/${postId}/dislike`, {
      method: 'POST',
      headers: {
          Authorization: token,
      },
  }).then((response) => {
      if (response.status === 401) {
          alert('Войдите, чтобы убрать лайк')
          throw new Error('Нет авторизации')
      }
      return response.json()
  })
}

export function deletePost({ token, postId }) {
	return fetch(`${postsHost}/${postId}`, {
					method: 'DELETE',
					headers: {
							Authorization: token,
					},
				}).then((response) => {
					
					return response.json()
			})
		}
