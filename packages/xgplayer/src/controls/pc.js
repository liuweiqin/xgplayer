import Player from '../player'

let pc = function () {
  let player = this
  let util = Player.util; let controls = player.controls; let root = player.root
  let clk = 0; let _click_

  function onVideoClick (e) {
    e.preventDefault()
    e.stopPropagation()
    if (document.activeElement !== player.video) {
      player.video.focus()
      return
    }
    if (!player.config.closeVideoClick) {
      clk++
      if (_click_) {
        clearTimeout(_click_)
      }
      if (clk === 1) {
        _click_ = setTimeout(function () {
          if (util.hasClass(player.root, 'xgplayer-nostart')) {
            return false
          } else if (!player.ended) {
            if (player.paused) {
              player.play()
            } else {
              player.pause()
            }
          }
          clk = 0
        }, 200)
      } else {
        clk = 0
      }
    }
  }
  player.video.addEventListener('click', e => { onVideoClick(e) })

  function onVideoDoubleClick (e) {
    e.preventDefault()
    e.stopPropagation()
    if (document.activeElement !== player.video) {
      player.video.focus()
      return
    }
    if (!player.config.closeVideoDblclick) {
      let fullscreen = controls.querySelector('.xgplayer-fullscreen')
      if (fullscreen) {
        let clk
        if (document.createEvent) {
          clk = document.createEvent('Event')
          clk.initEvent('click', true, true)
        } else {
          clk = new Event('click')
        }
        fullscreen.dispatchEvent(clk)
      }
    }
  }
  player.video.addEventListener('dblclick', e => { onVideoDoubleClick(e) })

  function onMouseEnter () {
    clearTimeout(player.leavePlayerTimer)
    player.emit('focus', player)
  }
  root.addEventListener('mouseenter', onMouseEnter)

  function onMouseLeave () {
    if(!player.config.closePlayerBlur) {
      player.leavePlayerTimer = setTimeout(function () {
        player.emit('blur', player)
      }, player.config.leavePlayerTime || 0)
    }
  }
  root.addEventListener('mouseleave', onMouseLeave, false)

  function onControlMouseEnter (e) {
    if (player.userTimer) {
      clearTimeout(player.userTimer)
    }
  }
  controls.addEventListener('mouseenter', onControlMouseEnter, false)

  function onControlMouseLeave (e) {
    if(!player.config.closeControlsBlur) {
      player.emit('focus', player)
    }
  }
  controls.addEventListener('mouseleave', onControlMouseLeave, false)

  function onReady (e) {
    if (player.config.autoplay) {
      player.start()
    }
  }
  player.once('ready', onReady)

  function onDestroy () {
    player.off('ready', onReady)
    player.off('destroy', onDestroy)
  }
  player.once('destroy', onDestroy)
}

Player.install('pc', pc)