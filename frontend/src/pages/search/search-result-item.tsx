import React from "react";
import {SearchResultItem} from "../../features/search/interface";
import {Card} from "antd";
import {ContentType} from "../../features/myBuJo/constants";
import {AccountBookOutlined, CarryOutOutlined, FileTextOutlined} from '@ant-design/icons';
import {useHistory} from "react-router-dom";
import './search.styles.less';

const {Meta} = Card;

type SearchResultItemProps = {
    item: SearchResultItem;
    index: number;
}

export const contentTypeIconMapper: { [key in ContentType]: React.ReactNode } = {
    [ContentType.TASK]: <CarryOutOutlined/>,
    [ContentType.TRANSACTION]: <AccountBookOutlined/>,
    [ContentType.NOTE]: <FileTextOutlined/>,
    [ContentType.PROJECT]: <FileTextOutlined/>,
    [ContentType.GROUP]: <FileTextOutlined/>,
    [ContentType.LABEL]: <FileTextOutlined/>,
    [ContentType.CONTENT]: <FileTextOutlined/>,
};

const SearchResultItemElement: React.FC<SearchResultItemProps> =
    ({
         item,
         index
     }) => {

        const history = useHistory();

        const getDescription = (item: SearchResultItem) => {
            return item.nameHighlights.concat(item.contentHighlights).map((highlight, i) => {
                return <p key={index.toString() + '#' + i.toString()}
                    dangerouslySetInnerHTML={{__html: highlight}}/>;
            });
        };

        const onClick = () => {
            history.push(`/${item.type.toString().toLowerCase()}/${item.id}`);
        };

        return <div onClick={onClick} className='search-item' key={index}>
            <Card hoverable
                  className='card-style'
                  style={{
                      borderRadius: '15px'
                  }}
            >
                <Meta title={item.name}
                      avatar={contentTypeIconMapper[item.type]}
                      description={getDescription(item)}/>
            </Card>
        </div>
    };

export default SearchResultItemElement;