# Credits
# --------------------
# Nearly all of the accelerometer code in here is from this article
# on how2electronics.com : 
# https://how2electronics.com/measuring-acceleration-with-adxl345-accelerometer-raspberry-pi/

import asyncio
import smbus
import math
import websockets
import board
import neopixel

# Initialize LEDS
pixels1 = neopixel.NeoPixel(board.D18, 30, brightness=1)
pixels2 = neopixel.NeoPixel(board.D21, 6, brightness=1)

# Constants
ADXL345_I2C_ADDR = 0x53
POWER_CTL, DATA_FORMAT = 0x2D, 0x31
DATAX0, DATAX1, DATAY0, DATAY1, DATAZ0, DATAZ1 = 0x32, 0x33, 0x34, 0x35, 0x36, 0x37

class ADXL345:
    G = 9.81  # Gravity

    def __init__(self, bus_num=1):
        self.bus = smbus.SMBus(bus_num)
        self.bus.write_byte_data(ADXL345_I2C_ADDR, DATA_FORMAT, 0x0B)
        self.bus.write_byte_data(ADXL345_I2C_ADDR, POWER_CTL, 0x08)

    def read_acceleration(self):
        bytes = self.bus.read_i2c_block_data(ADXL345_I2C_ADDR, DATAX0, 6)
        x, y, z = [(bytes[i+1] << 8 | bytes[i]) - (1 << 16) if bytes[i+1] & (1 << 7) else bytes[i+1] << 8 | bytes[i] for i in range(0, 6, 2)]
        return tuple((val / (2**15)) * 16 * self.G for val in (x, y, z))

    def get_tilt_angles(self):
        x, y, z = self.read_acceleration()
        pitch = math.degrees(math.atan2(y, math.sqrt(x**2 + z**2)))
        roll = math.degrees(math.atan2(-x, z))
        return pitch, roll

async def control_leds(pitch, roll):
    # Logic to control LEDs based on tilt
    if roll > 5:
        pixels1.fill((255, 0, 0))
        pixels2.fill((0, 0, 0))
    elif roll < -5:
        pixels1.fill((0, 0, 0))
        pixels2.fill((255, 0, 0))
    else:
        pixels1.fill((0, 0, 0))
        pixels2.fill((0, 0, 0))

# Global queue for messages
message_queue = asyncio.Queue()

async def websocket_manager(uri):
    while True:
        try:
            async with websockets.connect(uri) as websocket:
                while True:
                    message = await message_queue.get()
                    await websocket.send(message)
                    message_queue.task_done()
        except Exception as e:
            print(f"WebSocket connection failed: {e}, retrying ...")
            await asyncio.sleep(1)

async def send_data_to_queue(x, y, z, pitch, roll):
    message = f"{x:.3f},{y:.3f},{z:.3f},{pitch:.2f},{roll:.2f}"
    await message_queue.put(message)
    
async def main_loop():
    uri = "ws://0.0.0.0:3000"
    asyncio.create_task(websocket_manager(uri))
    accelerometer = ADXL345()
    while True:
        x, y, z = accelerometer.read_acceleration()
        pitch, roll = accelerometer.get_tilt_angles()

        await control_leds(pitch, roll)
        await send_data_to_queue(x, y, z, pitch, roll)

        await asyncio.sleep(0.1)

if __name__ == "__main__":
    asyncio.run(main_loop())
