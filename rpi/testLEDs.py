import time
import board
import neopixel

pixels1 = neopixel.NeoPixel(board.D18, 30, brightness=1)
pixels2 = neopixel.NeoPixel(board.D21, 6, brightness=1)

pixels1.fill((0, 255, 0))
pixels2.fill((0, 0, 255))

time.sleep(1.5)

pixels1.fill((200, 200, 0))
pixels2.fill((0, 200, 200))

time.sleep(1.5)

pixels1.fill((50, 70, 215))
pixels2.fill((215, 50, 70))

time.sleep(1.5)

pixels1.fill((0, 0, 0))
pixels2.fill((0, 0, 0))