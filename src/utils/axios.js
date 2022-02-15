import axios from 'axios';

function fetchGet(url) {
  return new Promise((resolve, reject) => {
    axios.get(url).then((res) => {
      if (res.status === 200) {
        resolve(res.data);
      } else {
        reject(new Error(`status is not 200, now is ${res.status}`));
      }
    }).catch((err) => reject(err));
  });
}

export {
  fetchGet,
};
