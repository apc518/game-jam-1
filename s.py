import os


print(sorted(os.listdir("client/explosion_frames")))

for i, item in enumerate(sorted(os.listdir("client/explosion_frames"))):
    os.rename(f"./client/explosion_frames/{item}", f"./client/explosion_frames/frame_{i}.png")