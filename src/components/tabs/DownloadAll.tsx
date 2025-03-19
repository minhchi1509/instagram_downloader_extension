import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Table,
  Tag,
  type TableColumnsType
} from "antd"
import { useMemo, useState } from "react"
import {
  DOWNLOAD_ALL_TYPE,
  DOWNLOAD_TYPE_TAG_COLOR,
  PROCESS_STATUS_TAG_COLOR,
  PROCESS_TEXT
} from "src/constants/variables"
import useDownloadHighlight from "src/hooks/useDownloadHighlight"
import useDownloadPost from "src/hooks/useDownloadPost"
import useDownloadReel from "src/hooks/useDownloadReel"
import {
  IDownloadProcess,
  TDownloadingType,
  TProcessStatus
} from "src/interfaces"
import { IDownloadAllForm } from "src/interfaces/form.interface"
import { getInstagramIdAndAvatarByUsername } from "src/services"
import useDownloadProcess from "src/store/download-process"
import { showErrorToast } from "src/utils/toast.util"
import { v4 as uuidv4 } from "uuid"

const DownloadAll = () => {
  const { downloadProcess, removeProcess, addProcess } = useDownloadProcess()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form] = Form.useForm<IDownloadAllForm>()
  const { startDownloadAllPosts } = useDownloadPost()
  const { startDownloadAllReels } = useDownloadReel()
  const { startDownloadAllHightlights } = useDownloadHighlight()

  const isWaitUntilCompleted = Form.useWatch("waitUntilCompleted", form)

  const handleSubmit = async (values: IDownloadAllForm) => {
    try {
      setIsSubmitting(true)
      await getInstagramIdAndAvatarByUsername(values.username)
      setIsSubmitting(false)
      const processId = uuidv4()
      addProcess({
        id: processId,
        username: values.username,
        downloadType: values.type,
        totalDownloadedItems: 0,
        status: "RUNNING"
      })
      if (values.type === "POST") {
        await startDownloadAllPosts(values.username, processId, { ...values })
      }
      if (values.type === "REEL") {
        await startDownloadAllReels(values.username, processId, { ...values })
      }
      if (values.type === "HIGHLIGHT") {
        await startDownloadAllHightlights(values.username, processId, {
          ...values
        })
      }
    } catch (error) {
      showErrorToast((error as Error).message)
    }
  }

  const tableColumns: TableColumnsType<IDownloadProcess> = useMemo(
    () => [
      {
        title: "STT",
        dataIndex: "ordinalNumber",
        key: "ordinalNumber",
        width: 70,
        render: (_, __, index) => index + 1
      },
      {
        title: "Username",
        dataIndex: "username",
        key: "username",
        render: (username: string) => (
          <p className="font-bold text-blue-700">{username}</p>
        )
      },
      {
        title: "Loại tải",
        dataIndex: "downloadType",
        key: "downloadType",
        render: (downloadType: TDownloadingType) => (
          <Tag color={DOWNLOAD_TYPE_TAG_COLOR[downloadType]}>
            {downloadType}
          </Tag>
        )
      },
      {
        title: "Số lượng đã tải",
        dataIndex: "totalDownloadedItems",
        key: "totalDownloadedItems"
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (status: TProcessStatus) => (
          <Tag color={PROCESS_STATUS_TAG_COLOR[status]}>
            {PROCESS_TEXT[status]}
          </Tag>
        )
      },
      {
        title: "Hành động",
        key: "action",
        render: (record: IDownloadProcess) =>
          record.status === "RUNNING" ? (
            <Button
              type="primary"
              danger
              onClick={() => removeProcess(record.id)}>
              Hủy
            </Button>
          ) : null
      }
    ],
    []
  )

  return (
    <div>
      <Form
        form={form}
        name="basic"
        autoComplete="off"
        onFinish={handleSubmit}
        layout="vertical"
        labelAlign="left">
        <div className="flex gap-3 items-center">
          <Form.Item<IDownloadAllForm>
            label="Username:"
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên người dùng!" }
            ]}
            style={{ flex: 1 }}>
            <Input addonBefore="https://www.instagram.com/" />
          </Form.Item>
          <Form.Item<IDownloadAllForm>
            label="Loại tải:"
            name="type"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn loại tải!"
              }
            ]}
            style={{ flex: 1 }}>
            <Select allowClear>
              {DOWNLOAD_ALL_TYPE.map((v) => (
                <Select.Option key={v.value} value={v.value}>
                  {v.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item<IDownloadAllForm>
            label="Tùy chọn cho tiến trình tải:"
            name="waitUntilCompleted"
            initialValue={true}
            style={{ flex: 1 }}>
            <Select>
              <Select.Option value={true}>
                Chờ đợi cho đến khi lượt tải xuống trước đó hoàn thành
              </Select.Option>
              <Select.Option value={false}>
                Thiết lập thời gian delay giữa các lần tải
              </Select.Option>
            </Select>
          </Form.Item>
          {!isWaitUntilCompleted ? (
            <Form.Item<IDownloadAllForm>
              label="Thời gian delay:"
              name="delayTimeInSecond"
              initialValue={0}
              style={{ flex: 1 }}>
              <InputNumber
                min={0}
                defaultValue={0}
                addonAfter="giây"
                style={{
                  width: "100%"
                }}
              />
            </Form.Item>
          ) : null}
        </div>

        <Form.Item wrapperCol={{ span: 24 }}>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            Tải
          </Button>
        </Form.Item>
      </Form>
      <Table
        columns={tableColumns}
        dataSource={downloadProcess}
        pagination={{
          pageSize: 5
        }}
      />
    </div>
  )
}

export default DownloadAll
