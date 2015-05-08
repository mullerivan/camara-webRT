class ProjectsController < ApplicationController
  before_action :set_project, only: [:show, :edit, :update, :destroy]

  def ajax_videometadata_update
    video = Video.find(params[:hiden_video_id])
    video.meters = params[:meters]
    video.name = params[:name]
    video.description = params[:description]
    video.save    
    respond_to do |format|
      format.js { render nothing: :true }
    end
  end

  def ajax_video_update
    project = Project.find params[:project_id]
    video = params[:'video-blob']
    # esto es proque si la session existe el video ya esta creado, y sino existe se crea despues!
    video_count = (session.has_key?("video_id")) ? project.videos.count : project.videos.count + 1
    save_path = Rails.root.join("public/videos")
    video_name = "project_#{project.name}_video_#{video_count}"

    File.open("#{save_path}/#{video_name}", 'wb') do |f|
      f.write video.read
    end

    # we create the video for the project
    if session.has_key?("video_id")       
      video = Video.find(session[:video_id])
      video.file = "/videos/#{video_name}"
      video.name = video_name
      video.width = params[:width]
      video.height = params[:height]
      video.save
      session.delete(:video_id)
    else
      project.videos.create project: project, file: "/videos/#{video_name}", name: video_name, width: params[:width], height: params[:height]
    end    
    video_id = project.videos.last.id
    respond_to do |format|
      format.json { render :json => { :video_id => video_id } }
    end
  end

  # FIXME: snapshot pertenece a un video. pero si creamos un snapshot ANTES que el video?
  # IDEAS: Creo que tenriamos que crear el video y asignarlo al projecto.
  # grabar el id del video en la secion del usuario
  # para despues utilizarlo en ajax_video_update, para ver si hay que crear el objeto video o solo asignarle el file!  
  # TO-DO: improve this
  # TO-DO: 
  #VOY A CAMBIARLE EL NOMBRE A LA FUNCION PARA DIFERENCIAR CUADO SUBIMOS SNAPSHOTS DE UN VIDEO CUANDO SE ESTA GRABANDO
  #O UNO CUANDO LO ESTAMOS REPRODUCIONDO

  def ajax_image_update_on_recording

    project = Project.find params[:project_id]
    #chekear si video_id ya existe en la session para no crear mas de un video por todos los snapshots!
    if session.has_key?("video_id")    
      video = Video.find(session[:video_id])   
    else
      video = project.videos.create project: project 
      session[:video_id] = video.id
    end
        
    image = params[:'image-image']
    snapshot_count = video.snapshots.count + 1
    save_path = Rails.root.join("public/videos")
    image_name = "project_#{project.id}_video_#{video.id}_snapshot_#{snapshot_count}"

    File.open("#{save_path}/#{image_name}.jpg", 'wb') do |f|
      f.write(Base64.decode64(image['data:image/jpeg;base64,'.length .. -1]))
    end
    video.snapshots.create video: video, file: image_name
    respond_to do |format|
      format.js { render nothing: :true }
    end
  end

  # GET /projects
  # GET /projects.json
  def index
    @projects = Project.all
  end

  # GET /projects/1
  # GET /projects/1.json
  def show    
    @project = Project.find params[:id]
    @videos = @project.videos
  end

  # GET /projects/new
  def new
    @project = Project.new
  end

  # GET /projects/1/edit
  def edit
  end

  # POST /projects
  # POST /projects.json
  def create
    @project = Project.new(project_params)

    respond_to do |format|
      if @project.save
        format.html { redirect_to @project, notice: 'Project was successfully created.' }
        format.json { render :show, status: :created, location: @project }
      else
        format.html { render :new }
        format.json { render json: @project.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /projects/1
  # PATCH/PUT /projects/1.json
  def update
    respond_to do |format|
      if @project.update(project_params)
        format.html { redirect_to @project, notice: 'Project was successfully updated.' }
        format.json { render :show, status: :ok, location: @project }
      else
        format.html { render :edit }
        format.json { render json: @project.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /projects/1
  # DELETE /projects/1.json
  def destroy
    @project.destroy
    respond_to do |format|
      format.html { redirect_to projects_url, notice: 'Project was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_project
      @project = Project.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def project_params
      params.require(:project).permit(:name, :description, :begin, :end, :place)
    end
end
