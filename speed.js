import axios from 'axios';
import { performance }  from 'perf_hooks';

const url = 'https://rtmp2.abnvideos.com/hls/abnchina.m3u8';

const getLatency = async () => {
    try {
        const response = await axios.get(url);
        const lines = response.data.split('\n');
        console.log(lines);
        let latencyMap = {};
    
        let currentStream = '';
    
        const targetDuration = lines.find(line => line.startsWith('#EXT-X-TARGETDURATION:'));
        const targetDurationValue = parseInt(targetDuration.split(':')[1]);
    
        for (let i = 4; i < lines.length; i += 2) {
          const latencyUrl = lines[i];
          console.log(latencyUrl)
    
        //   try {
        //     const response = await axios.head(latencyUrl, {
        //       maxRedirects: 0,
        //       validateStatus: (status) => status >= 200 && status < 400
        //     });
        //     const latency = performance.now() - response.config.ts;
    
        //     const sequenceNumber = parseInt(lines[i - 1].split(':')[1]);
    
        //     const latencyInSeconds = latency / 1000;
        //     const latencyOffset = sequenceNumber * targetDurationValue - latencyInSeconds;
    
        //     latencyMap[latencyUrl] = latencyOffset;
        //   } catch (error) {
        //     console.error(`获取直播流 ${latencyUrl} 的延迟速度时出错: ${error.message}`);
        //   }
        }
    
        console.log('各直播流的延迟速度:');
        console.log(latencyMap);
      } catch (error) {
        console.error(`下载 M3U8 文件时出错: ${error.message}`);
      }
    // try {
    //   const response = await axios.get(url);
    //   const lines = response.data.split('\n');
    //   let latencyMap = {};
  
    //   let currentStream = '';
  
    //   for (const line of lines) {
    //     if (line.startsWith('#EXT-X-STREAM-INF:')) {
    //       const streamInfo = line.split('BANDWIDTH=')[1].split(',')[0];
    //       currentStream = streamInfo;
    //     } else if (line.startsWith('http')) {
    //       const currentUrl = line;
  
    //       try {
    //         const response = await axios.head(currentUrl, {
    //           maxRedirects: 0,
    //           validateStatus: (status) => status >= 200 && status < 400
    //         });
    //         console.log(response)
    //         const latency = performance.now() - response.config.ts;
  
    //         latencyMap[currentStream] = latency;
    //       } catch (error) {
    //         console.error(`获取直播流 ${currentStream} 的延迟速度时出错: ${error.message}`);
    //       }
    //     }
    //   }
  
    //   console.log('各直播流的延迟速度:');
    //   console.log(latencyMap);
    // } catch (error) {
    //   console.error(`下载 M3U8 文件时出错: ${error.message}`);
    // }
  };
  
  getLatency();