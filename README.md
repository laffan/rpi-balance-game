# RPI Balance Game

Use an RPi + Accelerometer + Websockets to control a Phaser game using a physical board.


### RpI Setup

Add the following to `.config/wayfire.ini`. (The `read -n 1 -s` bit is to keep the window open. Thank to [dgonzalez](https://askubuntu.com/a/868814) )

```
[autostart]
term = lxterminal -e "cd ~/rpi-balance-game/; ./begin.sh; read -n 1 -s"
chromium = chromium-browser http://localhost:3000 --kiosk --noerrdialogs --disable-infobars --no-first-run --ozone-platform=wayland --start-maximized --hide-scrollbars
screensaver = false
```

# Credits

Nearly all the accelerometer connection material comes from the [Measuring Acceleration with ADXL345 Accelerometer & Raspberry Pi](https://how2electronics.com/measuring-acceleration-with-adxl345-accelerometer-raspberry-pi/) tutorial. 

Kiosk mode setup (above) thanks to the official [Kiosk Mode Tutorial](https://www.raspberrypi.com/tutorials/how-to-use-a-raspberry-pi-in-kiosk-mode/)


