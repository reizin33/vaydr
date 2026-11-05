"""junta várias capturas numa grade pequena (jpg) para olhar rápido: thumb.py saida.jpg largura img1 img2 ..."""
import sys
from PIL import Image
out=sys.argv[1];W=int(sys.argv[2]);fs=sys.argv[3:]
ims=[Image.open(f).convert('RGB') for f in fs]
cols=2 if len(ims)>1 else 1
w=W//cols;h=int(w*ims[0].height/ims[0].width)
rows=(len(ims)+cols-1)//cols
g=Image.new('RGB',(w*cols,h*rows),(0,0,0))
for i,im in enumerate(ims):g.paste(im.resize((w,h)),((i%cols)*w,(i//cols)*h))
g.save(out,quality=82)
