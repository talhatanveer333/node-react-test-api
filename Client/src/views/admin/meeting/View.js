import { Box, Button, Flex, Grid, GridItem, Heading, Text } from "@chakra-ui/react";
import Card from "components/card/Card";
import { HSeparator } from "components/separator/Separator";
import Spinner from "components/spinner/Spinner";
import moment from "moment";
import { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { Link, useNavigate, useParams } from "react-router-dom";
import { HasAccess } from "../../../redux/accessUtils";
import { getApi } from "services/api";
import { DeleteIcon } from "@chakra-ui/icons";
import { deleteApi } from "services/api";
import CommonDeleteModel from "components/commonDeleteModel";
import { FaFilePdf } from "react-icons/fa";
import html2pdf from "html2pdf.js";
const View = () => {

    const param = useParams()

    const [data, setData] = useState()
    const [deleteMany, setDeleteMany] = useState(false);
    const user = JSON.parse(localStorage.getItem("user"))
    const [isLoding, setIsLoding] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const params = useParams();


    const fetchData = async () => {
        setIsLoding(true)
        let response = await getApi('api/meeting/view/', param.id)
        console.log({ response });
        setData(response?.data);
        setIsLoding(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const generatePDF = () => {
        setLoading(true)
        const element = document.getElementById("reports");
        const hideBtn = document.getElementById("hide-btn");
        if (element) {
            hideBtn.style.display = 'none';
            html2pdf()
                .from(element)
                .set({
                    margin: [0, 0, 0, 0],
                    filename: `Meeting_Details_${moment().format("DD-MM-YYYY")}.pdf`,
                    image: { type: "jpeg", quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true, allowTaint: true },
                    jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
                })
                .save().then(() => {
                    setLoading(false)
                    hideBtn.style.display = '';
                })
            // }, 500);
        } else {
            console.error("Element with ID 'reports' not found.");
            setLoading(false)
        }
    };

    const handleDeleteMeeting = async (ids) => {
        try {
            setIsLoding(true)
            let response = await deleteApi('api/meeting/delete/', params.id)
            if (response.status === 200) {
                setDeleteMany(false)
                navigate(-1)
            }
        } catch (error) {
            console.log(error)
        }
        finally {
            setIsLoding(false)
        }
    }

    const [permission, contactAccess, leadAccess] = HasAccess(['Meetings', 'Contacts', 'Leads'])

    return (
        <>
            {isLoding ?
                <Flex justifyContent={'center'} alignItems={'center'} width="100%" >
                    <Spinner />
                </Flex> : <>

                    <Grid templateColumns="repeat(4, 1fr)" gap={3} id="reports">
                        <GridItem colSpan={{ base: 4 }}>
                            <Heading size="lg" m={3}>
                                {data?.meetingHistory?.agenda || ""}
                            </Heading>
                        </GridItem>
                        <GridItem colSpan={{ base: 4 }}>
                            <Card>
                                <Grid gap={4}>
                                    <GridItem colSpan={2}>
                                        <Box>
                                            <Flex justifyContent={"space-between"}>
                                                <Heading size="md" mb={3}>
                                                    Meeting Details
                                                </Heading>
                                                <Box id="hide-btn">
                                                    <Button leftIcon={<FaFilePdf />} size='sm' variant="brand" onClick={generatePDF} disabled={loading}>
                                                        {loading ? "Please Wait..." : "Print as PDF"}
                                                    </Button>
                                                    <Button leftIcon={<IoIosArrowBack />} size='sm' variant="brand" onClick={() => navigate(-1)} style={{ marginLeft: 10 }}>
                                                        Back
                                                    </Button>
                                                </Box>
                                            </Flex>
                                            <HSeparator />
                                        </Box>
                                    </GridItem>
                                    <GridItem colSpan={{ base: 2, md: 1 }}>
                                        <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}> Agenda </Text>
                                        <Text>{data?.meetingHistory?.agenda ? data?.meetingHistory?.agenda : ' - '}</Text>
                                    </GridItem>
                                    <GridItem colSpan={{ base: 2, md: 1 }}>
                                        <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}> Created By </Text>
                                        <Text>{data?.meetingHistory?.createBy?.firstName ? data?.meetingHistory?.createBy?.firstName : ' - '}</Text>
                                        <Text>{data?.meetingHistory?.createBy?.lastName ? data?.meetingHistory?.createBy?.lastName : ''}</Text>
                                    </GridItem>

                                    <GridItem colSpan={{ base: 2, md: 1 }}>
                                        <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}> DateTime </Text>
                                        <Text> {data?.meetingHistory?.dateTime ? moment(data?.meetingHistory?.dateTime).format('DD-MM-YYYY  h:mma ') : ' - '} [{data?.meetingHistory?.dateTime ? moment(data?.meetingHistory?.dateTime).toNow() : ' - '}]</Text>
                                    </GridItem>
                                    <GridItem colSpan={{ base: 2, md: 1 }}>
                                        <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}> Timestamp </Text>
                                        <Text> {data?.meetingHistory?.timestamp ? moment(data?.meetingHistory?.timestamp).format('DD-MM-YYYY  h:mma ') : ' - '} [{data?.meetingHistory?.timestamp ? moment(data?.meetingHistory?.timestamp).toNow() : ' - '}]</Text>
                                    </GridItem>
                                    <GridItem colSpan={{ base: 2, md: 1 }}>
                                        <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}> Location </Text>
                                        <Text>{data?.meetingHistory?.location ? data?.meetingHistory?.location : ' - '}</Text>
                                    </GridItem>
                                    <GridItem colSpan={{ base: 2, md: 1 }}>
                                        <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}>  Notes </Text>
                                        <Text>{data?.meetingHistory?.notes ? data?.meetingHistory?.notes : ' - '}</Text>
                                    </GridItem>
                                    <GridItem colSpan={{ base: 2, md: 1 }}>
                                        <Text fontSize="sm" fontWeight="bold" color={'blackAlpha.900'}> Attendes </Text>
                                        {data?.meetingHistory?.related === 'Contact' && contactAccess?.view ? data?.meetingHistory?.attendes && data?.meetingHistory?.attendes.map((item) => {
                                            return (
                                                <Link to={`/contactView/${item._id}`}>
                                                    <Text color='brand.600' sx={{ '&:hover': { color: 'blue.500', textDecoration: 'underline' } }}>{item.firstName + ' ' + item.lastName}</Text>
                                                </Link>
                                            )
                                        }) : data?.meetingHistory?.related === 'Lead' && leadAccess?.view ? data?.meetingHistory?.attendesLead && data?.meetingHistory?.attendesLead.map((item) => {
                                            return (
                                                <Link to={`/leadView/${item._id}`}>
                                                    <Text color='brand.600' sx={{ '&:hover': { color: 'blue.500', textDecoration: 'underline' } }}>{item.leadName}</Text>
                                                </Link>
                                            )
                                        }) : data?.meetingHistory?.related === 'contact' ? data?.meetingHistory?.attendes && data?.meetingHistory?.attendes.map((item) => {
                                            return (
                                                <Text color='blackAlpha.900' >{item.firstName + ' ' + item.lastName}</Text>
                                            )
                                        }) : data?.meetingHistory?.related === 'lead' ? data?.meetingHistory?.attendesLead && data?.meetingHistory?.attendesLead.map((item) => {
                                            return (
                                                <Text color='blackAlpha.900' >{item.leadName}</Text>
                                            )
                                        }) : '-'}
                                    </GridItem>
                                    {/* <Grid templateColumns={'repeat(2, 1fr)'} gap={4} id="reports">

                                    </Grid> */}
                                </Grid>
                            </Card>
                        </GridItem>

                    </Grid>
                    {(user.role === 'superAdmin' || (permission?.update || permission?.delete)) && <Card mt={3}>
                        <Grid templateColumns="repeat(6, 1fr)" gap={1}>
                            <GridItem colStart={6} >
                                <Flex justifyContent={"right"}>
                                    {(user.role === 'superAdmin' || permission?.delete) ? <Button size='sm' style={{ background: 'red.800' }} onClick={() => setDeleteMany(true)} leftIcon={<DeleteIcon />} colorScheme="red" >Delete</Button> : ''}
                                </Flex>
                            </GridItem>
                        </Grid>
                    </Card>
                    }

                </>}
            {/* Delete model */}
            <CommonDeleteModel isOpen={deleteMany} onClose={() => setDeleteMany(false)} type='Meetings' handleDeleteData={handleDeleteMeeting} ids={params.id} />
        </>
    );
};

export default View;
