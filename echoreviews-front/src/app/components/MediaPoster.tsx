interface Props {
  image: string;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
}

export function MediaPoster({
  image,
}: Props) {
  return (
    <div className="w-48 aspect-[2/3] overflow-hidden rounded-xl">
      <img
        src={image}
        className="w-full h-full object-cover"
      />
    </div>
  );
}