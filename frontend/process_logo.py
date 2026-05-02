from PIL import Image

# Open the original logo
img = Image.open('src/assets/logo.jpeg').convert('RGBA')
data = img.getdata()

new_data = []
for item in data:
    # 245 to 255 is mostly white. Make it fully transparent.
    if item[0] > 240 and item[1] > 240 and item[2] > 240:
        new_data.append((255, 255, 255, 0))
    else:
        new_data.append(item)

img.putdata(new_data)

# Crop out the borders and text to isolate the MP shield
# The image is 1563x1563. 
# Left, Upper, Right, Lower.
# A bit of trial and error conceptually: shield is centered horizontally.
left = 250
top = 100
right = 1313
bottom = 1150
img_cropped = img.crop((left, top, right, bottom))

# Save the transparency preserved PNG
img_cropped.save('src/assets/logo_transparent.png')

print("Created logo_transparent.png successfully!")
