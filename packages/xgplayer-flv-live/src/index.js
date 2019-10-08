import Player from 'xgplayer'
import { Context, EVENTS } from 'xgplayer-utils';
import FLV from './flv-live'
const flvAllowedEvents = EVENTS.FlvAllowedEvents;

class FlvPlayer extends Player {
  constructor (config) {
    super(config)
    this.context = new Context(flvAllowedEvents)
    this.initEvents()
    // const preloadTime = player.config.preloadTime || 15
  }

  start () {

    const flv = this.context.registry('FLV_CONTROLLER', FLV)(this)
    this.initFlvEvents(flv)
    this.flv = flv
    this.context.init()

    super.start(flv.mse.url)
  }

  initFlvEvents (flv) {
    const player = this;
    flv.once(EVENTS.REMUX_EVENTS.INIT_SEGMENT, () => {
      Player.util.addClass(player.root, 'xgplayer-is-live')
      const live = Player.util.createDom('xg-live', '正在直播', {}, 'xgplayer-live')
      player.controls.appendChild(live)
      const timer = setInterval(() => {
        if (player.paused && player.buffered.length) {
          for (let i = 0, len = player.buffered.length; i < len; i++) {
            if (player.buffered.start(i) > player.currentTime) {
              player.currentTime = player.buffered.start(i)
              clearInterval(timer)
              break
            }
          }
        }
      }, 200)
    })

    flv.once(EVENTS.LOADER_EVENTS.LOADER_COMPLETE, () => {
      // 直播完成，待播放器播完缓存后发送关闭事件
      const timer = setInterval(() => {
        const end = player.getBufferedRange()[1]
        if (Math.abs(player.currentTime - end) < 0.5) {
          player.emit('ended')
          clearInterval(timer)
        }
      }, 200)
    })
  }

  initEvents () {
    this.on('timeupdate', () => {
      this.loadData()
    })

    this.on('seeking', () => {
      const time = this.currentTime
      const range = this.getBufferedRange()
      if (time > range[1] || time < range[0]) {
        this.flv.seek(this.currentTime)
      }
    })

    this.once('destroy', () => {
      this.flv.destroy()
    })
  }

  loadData (time = this.currentTime) {
    this.flv.seek(time)
  }

  get src () {
    return this.currentSrc
  }

  set src (url) {
    this.player.config.url = url
    if (!this.paused) {
      this.pause()
      this.once('pause', () => {
        this.start(url)
      })
      this.once('canplay', () => {
        this.play()
      })
    } else {
      this.start(url)
    }
    this.once('canplay', () => {
      this.currentTime = 0
    })
  }
}

module.exports = FlvPlayer