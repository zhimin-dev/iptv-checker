import axios from 'axios';

var service = axios.create({
  timeout:5000,
  headers:{}
})

function fetchGet(url) {
  return new Promise((resolve, reject) => {
    service({
      url: url,
      method: 'GET',
    }).then((res) => {
        if (res.status === 200) {
          resolve(res.data);
        } else {
          reject(new Error(`status is not 200, now is ${res.status}`));
        }
    }).catch((err) => {
      console.log(err)
      reject(err)
    });
  });
}

export {
  fetchGet,
};
