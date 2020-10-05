'use strict';

const apiUrl = 'http://127.0.0.1:9999/api';
const header = {
    'Content-type': 'application/json',
};
const rootEl = document.getElementById('root');

const loaderEl = document.createElement('div');
loaderEl.dataset.id = 'loader';
const loadAnimation = document.createElement('div');
loadAnimation.innerHTML = '<span data-id="action-loader"><img src=./img/loader.gif> Пожалуйста подождите</span>';
loaderEl.appendChild(loadAnimation);
rootEl.appendChild(loaderEl);

const messageError = document.createElement('div');
messageError.dataset.id = 'message';
messageError.style.color = 'red';
messageError.style.display = 'none';
rootEl.appendChild(messageError);

const formEl = document.createElement('form');
formEl.dataset.id = 'post-form';
rootEl.appendChild(formEl);

const fieldEl = document.createElement('fieldset');
fieldEl.dataset.id = 'post-fields';
formEl.appendChild(fieldEl);

const mediaEl = document.createElement('media');
mediaEl.dataset.id = 'media';
fieldEl.appendChild(mediaEl);

const mediaInputEl = document.createElement('input');
mediaInputEl.dataset.id = 'media';
mediaInputEl.name = 'media';
mediaInputEl.type = 'file';
mediaEl.appendChild(mediaInputEl);

const dataType = document.createElement('input');
dataType.type = 'hidden';
fieldEl.appendChild(dataType);

const dataPath = document.createElement('input');
dataPath.type = 'hidden';
fieldEl.appendChild(dataPath);

const loadedFileContainer = document.createElement('div');
mediaEl.appendChild(loadedFileContainer);
mediaEl.onchange = evt => {
    const file = evt.target.files[0];
    const formData = new FormData();
    formData.append('media', file);
    const load = {
        onStart: () => {
            if (loadedFileContainer.firstChild) { loadedFileContainer.removeChild(loadedFileContainer.firstElementChild); }
            loaderEl.style.display = 'fixed';
            addEl.disabled = true;
        },
        onFinish: () => {
            loaderEl.style.display = 'none';
            addEl.disabled = false;
        },
        onError: error => {
            console.log(error.message);
            messageError.textContent = 'Соединение с сервером отсутствует. Пожалуйста проверьте подключение к сети и обновите страницу';
            messageError.style.display = 'fixed';
        },
        onSuccess: data => {
            const attachment = JSON.parse(data);
            evt.target.value = '';
            dataType.value = attachment.type;
            dataPath.value = attachment.path;
            mediaEl.insertBefore(removeMediaButton, mediaEl.firstElementChild);
            mediaEl.removeChild(mediaInputEl);
            makeMedia(attachment, loadedFileContainer);
        },
    };
    ajax('POST', `${apiUrl}/media`, '', load, formData);
};
const removeMediaButton = document.createElement('button');
removeMediaButton.dataset.action = 'remove-media';
removeMediaButton.textContent = 'X';
removeMediaButton.onclick = () => {
    loadedFileContainer.removeChild(loadedFileContainer.firstElementChild);
    dataPath.value = '';
    dataType.value = '';
    mediaEl.removeChild(removeMediaButton);
    mediaEl.appendChild(mediaInputEl);
    if (fieldEl.disabled = true) { fieldEl.disabled = false; }
};
const authorLabel = document.createElement('label');
authorLabel.textContent = ' Ваше имя ';
authorLabel.htmlFor = 'author';
fieldEl.appendChild(authorLabel);

const authorEl = document.createElement('input');
authorEl.dataset.input = 'author';
authorEl.id = 'author';
fieldEl.appendChild(authorEl);

const textLabel = document.createElement('label');
textLabel.textContent = ' Что у вас нового? ';
textLabel.htmlFor = 'text';
fieldEl.appendChild(textLabel);

const textEl = document.createElement('input');
textEl.dataset.input = 'text';
textEl.id = 'text';
fieldEl.appendChild(textEl);

const postIdEl = document.createElement('input');
postIdEl.type = 'hidden';
postIdEl.value = '0';
fieldEl.appendChild(postIdEl);

const addEl = document.createElement('button');
addEl.dataset.action = 'add';
addEl.textContent = 'Опубликовать';
fieldEl.appendChild(addEl);
formEl.addEventListener('submit', evt => {
    evt.preventDefault();
    messageError.textContent = '';
    messageError.style.display = 'none';
    if (authorEl.value.trim() === '') {
        authorEl.focus();
        messageError.textContent = 'Введите ваше имя';
        messageError.style.color = 'red';
        messageError.style.display = 'block';
        return;
    }
    if (dataType.value.trim() === '') {
        messageError.textContent = 'Загрузите пожалуйста медиа файл. (Фото, Видео, Аудио)';
        messageError.style.color = 'red';
        messageError.style.display = 'block';
        return;
    }
    const type = dataType.value;
    const path = dataPath.value;
    postIdEl.value = postIdEl.value;
    let post = {
        'attachment': { 'type': type, 'path': path },
        'id': +postIdEl.value,
        'author': authorEl.value.trim(),
        'text': textEl.value,
        'likes': 0,
        'comments': [],
    };
    loaderEl.style.display = 'none';
    ajax('POST', `${apiUrl}/posts`, header, {
        onStart: () => {
            loaderEl.style.display = 'block';
            fieldEl.disabled = true;
        },
        onFinish: () => {
            loaderEl.style.display = 'none';
            fieldEl.disabled = false;
            formEl.reset();
            authorEl.focus();
            dataType.value = '';
            dataPath.value = '';
            mediaEl.appendChild(mediaInputEl);
        },
        onSuccess: data => {
            post = JSON.parse(data);
            posts.unshift(post);
            makeWall(postsEl, [post]);
            loadedFileContainer.removeChild(loadedFileContainer.firstElementChild);
            mediaEl.removeChild(removeMediaButton);
        },
    }, JSON.stringify(post));//posting post
});

const postsEl = document.createElement('div');
postsEl.dataset.id = 'posts';
rootEl.appendChild(postsEl);
let posts = [];
ajax('GET', `${apiUrl}/posts`, '', {
    onStart: () => {
        loaderEl.style.display = 'block';
        fieldEl.disabled = true;
    },
    onError: error => {
        console.log(error.message);
        messageError.textContent = 'Соединение с сервером отсутствует. Пожалуйста проверьте подключение к сети и обновите страницу';
        messageError.style.display = 'block';
    },
    onFinish: () => {
        loaderEl.style.display = 'none';
        rootEl.appendChild(oldPosts);
    },
    onSuccess: data => {
        if (data) {
            posts = JSON.parse(data);
            makeWall(postsEl, posts);
            fieldEl.disabled = false;
            oldPosts.style.display = 'block';
        }
    },
}, ''); //load new posts 5

const newPosts = document.createElement('button');
newPosts.dataset.action = 'new-posts';
newPosts.style.display = 'none';
rootEl.insertBefore(newPosts, postsEl);
let postsTemp = [];
const interval = 5000;
setInterval(() => {
    let id = 0;
    posts.forEach(el => {
        if (id < el.id) {
            id = el.id;
        }
    });
    ajax('GET', `${apiUrl}/posts/after/${id}`, '', {
        onError: () => {
            messageError.style.display = 'block';
            messageError.textContent = 'Соединение с сервером отсутствует. Пожалуйста проверьте подключение к сети и обновите страницу';
            fieldEl.disabled = true;
        },
        onSuccess: (data) => {
            let attachment = JSON.parse(data);
            posts.forEach(post => attachment = attachment.filter(el => el.id !== post.id));
            postsTemp.forEach(post => attachment = attachment.filter(el => el.id !== post.id));
            Array.prototype.unshift.apply(postsTemp, attachment);
            if (postsTemp.length > 1) {
                const amount = postsTemp.length;
                newPosts.textContent = `Показать ${amount} новых записей`;
                newPosts.style.display = 'block';
            }
            if (postsTemp.length === 1) {
                const amount = postsTemp.length;
                newPosts.textContent = `Показать ${amount} новую запись`;
                newPosts.style.display = 'block';
            }
            if (postsTemp.length !== 0) {
                postsTemp.forEach(post => posts = posts.filter(el => el.id !== post.id));
                Array.prototype.unshift.apply(posts, postsTemp);
            }
            messageError.style.display = 'none';
            fieldEl.disabled = false;
        },
    }, null);
}, interval);
newPosts.onclick = () => {
    postsTemp.forEach(post => posts = posts.filter(el => el.id !== post.id));
    Array.prototype.unshift.apply(posts, postsTemp);
    makeWall(postsEl, postsTemp);
    newPosts.style.display = 'none';
    postsTemp = [];
};

const oldPosts = document.createElement('button');
oldPosts.dataset.action = 'old-posts';
oldPosts.textContent = 'Загрузить еще';
oldPosts.onclick = () => {
    let lastId = 0;
    if (posts.length !== 0) {
        const last = posts[posts.length - 1];
        lastId = last.id;
    }
    const postsGroup = 5;
    ajax('GET', `${apiUrl}/posts/before/${lastId}`, '', {
        onStart: () => {
            oldPosts.style.display = 'none';
            rootEl.removeChild(loaderEl);
            rootEl.appendChild(loaderEl);
            loaderEl.style.display = 'block';
        },
        onFinish: () => {
            rootEl.appendChild(oldPosts);
            rootEl.insertBefore(loaderEl, rootEl.firstElementChild);
            loaderEl.style.display = 'none';
        },
        onSuccess: data => {
            const attachment = JSON.parse(data);
            if (attachment.length < postsGroup) {
                oldPosts.style.display = 'none';
            } else { oldPosts.style.display = 'block'; }
            Array.prototype.push.apply(posts, attachment);
            loadOldPosts(postsEl, attachment);
            rootEl.removeChild(loaderEl);
        },
    }, null);//load old posts  5
};

function ajax(method, url, headers, callbacks, body) {
    if (typeof callbacks.onStart === 'function') {
        callbacks.onStart();
    }
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = () => {
        if (xhr.status < 200 || xhr.status > 299) {
            const error = xhr.responseText;
            if (typeof callbacks.onError === 'function') {
                callbacks.onError(error);
            }
            return;
        }
        const data = xhr.responseText;
        if (typeof callbacks.onSuccess === 'function') {
            callbacks.onSuccess(data);
        }
    };
    xhr.onerror = () => {
        if (typeof callbacks.onError === 'function') {
            callbacks.onError({ error: 'network error' });
        }
    };
    xhr.onloadend = () => {
        if (typeof callbacks.onFinish === 'function') {
            callbacks.onFinish();
        }
    };
    for (const head of Object.keys(headers)) {
        xhr.setRequestHeader(head, headers[head]);
    }
    if (body) {
        xhr.send(body);
    } else {
        xhr.send();
    }
}

function makePostEl(post) {
    const newPostEl = document.createElement('div');
    newPostEl.dataset.type = 'post';
    newPostEl.dataset.postId = post.id;

    const authorOfPost = document.createElement('div');
    authorOfPost.dataset.postPart = 'author';
    authorOfPost.style.fontWeight = 'bold';
    authorOfPost.style.color = 'blue';
    authorOfPost.textContent = post.author;
    newPostEl.appendChild(authorOfPost);

    const mediaContainer = document.createElement('div');
    mediaContainer.dataset.type='media';
    newPostEl.appendChild(mediaContainer);
    makeMedia(post.attachment, mediaContainer);

    const textOfPost = document.createElement('div');
    textOfPost.dataset.postPart = 'text';
    textOfPost.textContent = post.text;
    newPostEl.appendChild(textOfPost);

    const likesContainer = document.createElement('div');
    likesContainer.dataset.type='likes';
    likesContainer.textContent = 'Нравится: ❤️ ';
    newPostEl.appendChild(likesContainer);

    const likesAmount = document.createElement('span');
    likesAmount.dataset.info = 'likes';
    likesAmount.textContent = `${post.likes} `;
    likesContainer.appendChild(likesAmount);

    const likedEl = document.createElement('button');
    likedEl.dataset.action = 'like';
    likedEl.textContent = '+1';
    likesContainer.appendChild(likedEl);
    const loadEl = document.createElement('div');
    loadEl.innerHTML = '<span data-id="action-loader"><img src=./img/loader.gif></span>';
    likedEl.onclick = () => {
        like('POST', `${apiUrl}/posts/${post.id}/likes`, likesContainer, newPostEl, likesAmount, loadEl, post, commentForm, messageEl);
    };
    const dislikedEl = document.createElement('button');
    dislikedEl.dataset.action = 'dislike';
    dislikedEl.textContent = '-1';
    likesContainer.appendChild(dislikedEl);
    dislikedEl.onclick = () => {
        dislike('DELETE', `${apiUrl}/posts/${post.id}/likes`, likesContainer, newPostEl, likesAmount, loadEl, post, commentForm, messageEl);
    };
    editCurrentPost(likesContainer, post, authorOfPost, textOfPost, mediaContainer);

    const removeEl = document.createElement('button');
    removeEl.dataset.action = 'remove';
    removeEl.textContent = 'Удалить';
    likesContainer.appendChild(removeEl);

    removePost(post, newPostEl, removeEl);

    const commentForm = document.createElement('form');
    commentForm.dataset.form = 'comment';
    newPostEl.appendChild(commentForm);

    const messageEl = document.createElement('div');
    messageEl.dataset.id = 'message';
    messageEl.style.display = 'none';

    addComment(newPostEl, commentForm, post, loadEl, messageEl);
    return newPostEl;
}

function makeMedia(dataMedia, container) {
    if (dataMedia.type === 'audio') {
        const audioEl = document.createElement('audio');
        audioEl.controls = true;
        audioEl.src = dataMedia.path;
        container.appendChild(audioEl);
    }
    if (dataMedia.type === 'video') {
        const videoEl = document.createElement('video');
        videoEl.dataset.type='video';
        videoEl.controls = true;
        videoEl.src = dataMedia.path;
        container.appendChild(videoEl);
    }
    if (dataMedia.type === 'image') {
        const imageEl = document.createElement('img');
        imageEl.dataset.type='image';
        imageEl.src = dataMedia.path;
        container.appendChild(imageEl);
    }
}

function editCurrentPost(divContainer, currentPost, authorOfPost, textofPost, mediaFileContainer) {
    const editEl = document.createElement('button');
    editEl.dataset.action = 'edit';
    editEl.textContent = 'Изменить публикацию';
    divContainer.appendChild(editEl);

    const saveEl = document.createElement('button');
    saveEl.dataset.action = 'save';
    saveEl.textContent = 'Сохранить';

    const cancelEl = document.createElement('button');
    cancelEl.dataset.action = 'cancel';
    cancelEl.textContent = 'Отмена';

    editEl.onclick = () => {
        authorEl.value = currentPost.author;
        textEl.value = currentPost.text;
        postIdEl.value = currentPost.id;
        dataType.value = currentPost.attachment.type;
        dataPath.value = currentPost.attachment.path;
        fieldEl.removeChild(addEl);
        fieldEl.appendChild(saveEl);
        fieldEl.appendChild(cancelEl);
        mediaEl.insertBefore(removeMediaButton, mediaEl.firstElementChild);
        mediaEl.removeChild(mediaInputEl);
        makeMedia(currentPost.attachment, loadedFileContainer);
    };
    saveEl.onclick = () => {
        postIdEl.value = postIdEl.value;
        if (authorEl.value.trim() === '') {
            authorEl.focus();
            messageError.textContent = 'Введите ваше имя';
            messageError.style.color = 'red';
            messageError.style.display = 'block';
            return;
        }
        if (dataType.value.trim() === '') {
            messageError.textContent = 'Загрузите пожалуйста медиа файл. (Фото, Видео, Аудио)';
            messageError.style.color = 'red';
            messageError.style.display = 'block';
            return;
        }
        let editPost = {
            'attachment': { 'type': dataType.value, 'path': dataPath.value },
            'id': +postIdEl.value,
            'author': authorEl.value.trim(),
            'text': textEl.value,
            'likes': currentPost.likes,
            'comments': currentPost.comments,
        };
        ajax('POST', `${apiUrl}/posts`, header, {
            onStart: () => {
                loaderEl.style.display = 'block';
                fieldEl.disabled = true;
            },
            onFinish: () => {
                loaderEl.style.display = 'none';
                fieldEl.disabled = false;
                formEl.reset();
                postIdEl.value = 0;
                fieldEl.removeChild(saveEl);
                fieldEl.removeChild(cancelEl);
                fieldEl.appendChild(addEl);
                dataType.value = '';
                dataPath.value = '';
                mediaEl.appendChild(mediaInputEl);
                const index = posts.findIndex(o => o.id === editPost.id);
                posts[index].author = editPost.author;
                posts[index].text = editPost.text;
                if (fieldEl.disabled = true) { fieldEl.disabled = false; }
            },
            onSuccess: (data) => {
                editPost = JSON.parse(data);
                authorOfPost.textContent = authorEl.value;
                textofPost.textContent = textEl.value;
                loadedFileContainer.removeChild(loadedFileContainer.firstElementChild);
                mediaEl.removeChild(removeMediaButton);
                makeMedia(editPost.attachment, mediaFileContainer);
                mediaFileContainer.removeChild(mediaFileContainer.firstElementChild);
            },
        }, JSON.stringify(editPost));//editing post
    };
    cancelEl.onclick = () => {
        fieldEl.removeChild(saveEl);
        fieldEl.removeChild(cancelEl);
        fieldEl.appendChild(addEl);
        mediaEl.appendChild(mediaInputEl);
        formEl.reset();
        postIdEl.value = 0;
        dataType.value = '';
        dataPath.value = '';
        if (loadedFileContainer.firstElementChild) {
            loadedFileContainer.removeChild(loadedFileContainer.firstElementChild);
            mediaEl.removeChild(removeMediaButton);
        }
        if (fieldEl.disabled = true) { fieldEl.disabled = false; }
    };
}

function addComment(currentPostEl, currentComment, currentPost, load, errorMessageEl) {

    currentComment.appendChild(errorMessageEl);

    const inputComment = document.createElement('input');
    inputComment.dataset.id = 'text';
    currentComment.appendChild(inputComment);

    const addCommentButton = document.createElement('button');
    addCommentButton.textContent = 'Добавить комментарий';
    currentComment.appendChild(addCommentButton);
    currentComment.onsubmit = evt => {
        evt.preventDefault();
        if (inputComment.value.trim() === '') {
            inputComment.focus();
            errorMessageEl.textContent = 'Введите ваш комментарий';
            errorMessageEl.style.display = 'block';
            return;
        }
        errorMessageEl.textContent = '';
        errorMessageEl.style.display = 'none';
        const comment = {
            'id': 0,
            'text': inputComment.value.trim(),
        };
        ajax('POST', `${apiUrl}/posts/${currentPost.id}/comments`, header, {
            onStart: () => {
                currentPostEl.removeChild(currentComment);
                currentPostEl.insertBefore(load, commentsEl);
            },
            onError: () => {
                errorMessageEl.textContent = 'Нет сети, проверьте подключение к интернету';
                errorMessageEl.style.color = 'red';
                errorMessageEl.style.display = 'block';
            },
            onFinish: () => {
                currentPostEl.removeChild(load);
                currentPostEl.insertBefore(currentComment, commentsEl);
                currentComment.reset();
                inputComment.focus();
            },
            onSuccess: data => {
                const attachment = JSON.parse(data);
                currentPost.comments.push(attachment);
                Array.from(commentsEl.children).forEach(o => commentsEl.removeChild(o));
                renderComment(commentsEl, currentPost);
            },
        }, JSON.stringify(comment));//post comments
    };
    const commentsEl = document.createElement('div');
    commentsEl.dataset.postPart = 'comments';
    currentPostEl.appendChild(commentsEl);
    renderComment(commentsEl, currentPost);
}

function makeWall(el, items) {
    const firstChild = el.firstChild;
    items.map(makePostEl).forEach(element => {
        el.insertBefore(element, firstChild);
    });
}

function loadOldPosts(el, items) {
    items.map(makePostEl).forEach(element => {
        el.appendChild(element);
    });
}

function like(method, url, likeContainer, newPost, likes, load, currentPost, form, errorMessageEl) {
    ajax(method, url, '', {
        onStart: () => {
            newPost.removeChild(likeContainer);
            newPost.insertBefore(load, form);
        },
        onError: () => {
            errorMessageEl.textContent = 'Нет сети, проверьте подключение к интернету';
            errorMessageEl.style.color = 'red';
            errorMessageEl.style.display = 'block';
        },
        onFinish: () => {
            newPost.removeChild(load);
            newPost.insertBefore(likeContainer, form);
        },
        onSuccess: () => {
            const thisPost = posts.find((post) => post.id === currentPost.id);
            thisPost.likes++;
            likes.textContent = `${thisPost.likes} `;
        },
    }, null);
}

function dislike(method, url, likeContainer, newPost, likes, load, currentPost, form, errorMessageEl) {
    ajax(method, url, '', {
        onStart: () => {
            newPost.removeChild(likeContainer);
            newPost.insertBefore(load, form);
        },
        onError: () => {
            errorMessageEl.textContent = 'Нет сети, проверьте подключение к интернету';
            errorMessageEl.style.color = 'red';
            errorMessageEl.style.display = 'block';
        },
        onFinish: () => {
            newPost.removeChild(load);
            newPost.insertBefore(likeContainer, form);
        },
        onSuccess: () => {
            const thisPost = posts.find((post) => post.id === currentPost.id);
            thisPost.likes--;
            likes.textContent = `${thisPost.likes} `;
        },
    }, null);
}

function removePost(currentPost, newPost, remove) {
    remove.onclick = () => {
        postsEl.removeChild(newPost);
        ajax('DELETE', `${apiUrl}/posts/${currentPost.id}`, '', {
            onStart: () => {
                loaderEl.style.display = 'block';
            },
            onFinish: () => {
                loaderEl.style.display = 'none';
            },
            onSuccess: () => {
                posts = posts.filter(o => o.id !== currentPost.id);
            },
        }, null);///delete post
    };
}

function makeCommentEl(comment) {
    const commentEl = document.createElement('div');
    commentEl.dataset.commentId = comment.id;
    commentEl.textContent = comment.text;
    return commentEl;
}

function renderComment(el, items) {
    items.comments.map(makeCommentEl).forEach(element => {
        el.appendChild(element);
    });
}