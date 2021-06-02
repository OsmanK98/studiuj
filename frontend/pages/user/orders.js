import DashboardAuth from "../../components/dashboard/DashboardAuth";
import * as React from 'react';
import {DataGrid} from '@material-ui/data-grid';
import {useDispatch} from "react-redux";
import {Button} from "@material-ui/core";
import {gql, useMutation, useQuery} from "@apollo/client";
import ButtonLink from "../../components/ButtonLink";
import axios from "axios";
import {setMessage} from "../../src/actions/message";
import {GET_MEETINGS_INFO} from './meetings'

const CREATE_MEET = gql`
    mutation CREATE_MEET($order: ID!$zoom:String!) {
        CreateMeet(order_id: $order,zoom_link:$zoom){
            id
        }
    }
`;

function CreateButton({params}) {
    const dispatch = useDispatch();
    const [CreateMeet, {loading: loadingCreate, error: errorCreate, data: dataCreate}] = useMutation(
        CREATE_MEET, {refetchQueries: [{query: GET_MEETINGS_INFO}]});
    const handleCreate = async (id, link) => {
        const zoomLink = String(link.start_url)
        const res = await CreateMeet({
            variables: {
                order: id,
                zoom: zoomLink,
            }
        });
    };
    const handleClick = () => {
        const isSure = confirm("Jesteś pewny, że chcesz utworzyć spotkanie?");
        if (isSure) {
            axios
                .post(process.env.BACKEND_HOST + "/api/meetings")
                .then((res) => {
                    console.log(res)
                    handleCreate(params.row.id, res.data).then(r => console.log("created"))
                    dispatch(setMessage("Pomyślnie utworzono spotkanie", "success"));
                })
                .catch((err) => {
                    console.error(err);
                    dispatch(setMessage("Nie udało się utworzyć spotkania", "error"));
                });
        }
    };
    if (params.row.advType === 'looking') return null
    return (
        <Button disabled={loadingCreate} variant="contained" color="secondary" onClick={handleClick}>
            Utwórz
        </Button>
    );
}

const columns = [
        {field: 'id', headerName: 'ID', width: 90},
        {field: 'type', headerName: 'Typ', width: 100},
        {field: 'name', headerName: 'Odbiorca', width: 190},
        {
            field: 'advertisement',
            headerName: 'Nazwa',
            width: 150,
        },
        {
            field: 'payment',
            headerName: 'Status',
            width: 130,
        },
        {
            field: "profil",
            headerName: "Profil",
            width: 130,

            sortable: false,
            disableClickEventBubbling: true,
            renderCell: (params) => (
                <ButtonLink color="primary" variant="contained"
                            href={`/user/${params.row.uuid}`}>profil</ButtonLink>

            ),
        },
        {
            field: "create",
            headerName: "Utwórz spotkanie",
            sortable: false,
            width: 190,

            disableClickEventBubbling: true,
            renderCell: (params) => (
                <CreateButton params={params}/>
            ),
        },
    ]
;


export default function OrdersPage() {
    const GET_ORDERS_INFO = gql`
        query orders {
            orders{
                id
                advertisement{
                    type
                    name
                    user{
                        uuid
                        name
                    }
                }
            }
        }
    `;
    const {loading, error, data} = useQuery(GET_ORDERS_INFO);
    if (error) {
        console.log(error.graphQLErrors)
    }
    if (loading || !data) return <p>Loading...</p>;
    let rows = []
    data.orders.forEach((order) => (
        rows.push({
            id: order.id,
            type: order.advertisement.type === 'offer' ? 'sprzedaję' : 'kupuję',
            name: order.advertisement.user.name,
            advertisement: order.advertisement.name,
            payment: '',
            uuid: order.advertisement.user.uuid,
            advType: order.advertisement.type,

        })
    ))


    return (
        <div style={{height: 400, width: '100%'}}>
            <DataGrid rows={rows} columns={columns} pageSize={5}/>
        </div>
    );
}
OrdersPage.Layout = DashboardAuth;


