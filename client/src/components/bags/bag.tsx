import React from 'react';
import { BagProps } from '@/types/bag';
import { Trash2, Copy, ArrowRightCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Bag: React.FC<BagProps> = React.memo(({data, duplicate, onDelete}) => {

const navigate = useNavigate()
  
  return (
    <div className="rounded-lg dark:bg-dark-box bg-white cursor-pointer shadow-lg h-[210px]">
      <img src={data.imageUrl} alt={data.name} className="w-full h-40 object-cover rounded-t-lg mb-3" onClick={() => navigate(`/bag/${data._id}`)}/>
      <div className="flex items-center justify-between px-2 pb-2">
        <h3 className="px-2 truncate">{data.name}</h3>
        <div className="flex space-x-3 px-2">
          <button title="Navigate" onClick={() => navigate(`/bag/${data._id}`)} >
            <ArrowRightCircle className="w-4 h-4 hover:text-primary" />
          </button>
          <button title="Duplicate" onClick={duplicate}>
            <Copy className="w-4 h-4 hover:text-secondary" />
          </button>
          <button title="Delete" onClick={onDelete}>
            <Trash2 className="w-4 h-4 hover:text-red-500" />
          </button>
        </div>
      </div>
    </div>
  );
});

export default Bag;
